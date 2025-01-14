import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface SubnetDefinition {
  cidr: string; // CIDR block for the subnet
  availabilityZone: string; // Specific AZ for the subnet
}

export interface VpcPeeringProps {
  readonly peerVpcId: string; // VPC ID of the peered VPC (same account only)
  readonly peerCidr: string; // CIDR block of the peered VPC
}

export interface TransitGatewayProps {
  readonly tgwId: string; // Transit Gateway ID
  readonly spokeVpcCidrs: string[]; // List of CIDRs for other VPCs connected to the TGW
}

export interface StacksmithsVpcProps {
  readonly cidr: string; // CIDR block for the VPC (required)
  readonly publicSubnets?: SubnetDefinition[]; // Public subnet definitions
  readonly privateSubnets?: SubnetDefinition[]; // Private subnet definitions
  readonly enableDnsHostnames?: boolean; // Enable DNS hostnames (optional, default: true)
  readonly enableDnsSupport?: boolean; // Enable DNS support (optional, default: true)
  readonly vpcPeering?: VpcPeeringProps; // VPC peering configuration (optional, same account only)
  readonly transitGateway?: TransitGatewayProps; // Transit Gateway configuration (optional)
}

export class StacksmithsVpc extends Construct {
  public readonly vpc: ec2.Vpc;

  constructor(scope: Construct, id: string, props: StacksmithsVpcProps) {
    super(scope, id);

    if (!props.cidr) {
      throw new Error("CIDR block must be specified.");
    }

    if ((!props.publicSubnets || props.publicSubnets.length === 0) && (!props.privateSubnets || props.privateSubnets.length === 0)) {
      throw new Error("At least one public or private subnet must be specified.");
    }

    // Create the VPC without automatic subnet configurations
    this.vpc = new ec2.Vpc(this, "CustomVpc", {
      ipAddresses: ec2.IpAddresses.cidr(props.cidr),
      enableDnsHostnames: props.enableDnsHostnames ?? true,
      enableDnsSupport: props.enableDnsSupport ?? true,
      subnetConfiguration: [], // No automatic subnets
    });

    // Create the Internet Gateway
    const igw = new ec2.CfnInternetGateway(this, "InternetGateway");
    new ec2.CfnVPCGatewayAttachment(this, "IGWAttachment", {
      internetGatewayId: igw.ref,
      vpcId: this.vpc.vpcId,
    });

    // Handle public subnets
    const publicRouteTable = new ec2.CfnRouteTable(this, "PublicRouteTable", {
      vpcId: this.vpc.vpcId,
    });

    const publicSubnets = (props.publicSubnets ?? []).map((subnet, index) => {
      const publicSubnet = new ec2.Subnet(this, `PublicSubnet-${index + 1}`, {
        vpcId: this.vpc.vpcId,
        cidrBlock: subnet.cidr,
        availabilityZone: subnet.availabilityZone,
        mapPublicIpOnLaunch: true,
      });

      if (index === 0) {
        new ec2.CfnRoute(this, `PublicRoute`, {
          routeTableId: publicRouteTable.ref,
          destinationCidrBlock: "0.0.0.0/0",
          gatewayId: igw.ref,
        });
      }

      new ec2.CfnSubnetRouteTableAssociation(this, `PublicSubnetRouteTableAssoc-${index + 1}`, {
        routeTableId: publicRouteTable.ref,
        subnetId: publicSubnet.subnetId,
      });

      return publicSubnet;
    });

    // Handle private subnets
    const privateRouteTables: ec2.CfnRouteTable[] = [];
    props.privateSubnets?.forEach((subnet, index) => {
      const privateSubnet = new ec2.Subnet(this, `PrivateSubnet-${index + 1}`, {
        vpcId: this.vpc.vpcId,
        cidrBlock: subnet.cidr,
        availabilityZone: subnet.availabilityZone,
        mapPublicIpOnLaunch: false,
      });

      const privateRouteTable = new ec2.CfnRouteTable(this, `PrivateRouteTable-${index + 1}`, {
        vpcId: this.vpc.vpcId,
      });

      if (publicSubnets.length > 0) {
        const natGateway = new ec2.CfnNatGateway(this, `NatGateway-${index + 1}`, {
          subnetId: publicSubnets[index % publicSubnets.length].subnetId,
          allocationId: new ec2.CfnEIP(this, `EIP-${index + 1}`).attrAllocationId,
        });

        new ec2.CfnRoute(this, `PrivateRoute-${index + 1}`, {
          routeTableId: privateRouteTable.ref,
          destinationCidrBlock: "0.0.0.0/0",
          natGatewayId: natGateway.ref,
        });
      }

      new ec2.CfnSubnetRouteTableAssociation(this, `PrivateSubnetRouteTableAssoc-${index + 1}`, {
        routeTableId: privateRouteTable.ref,
        subnetId: privateSubnet.subnetId,
      });

      privateRouteTables.push(privateRouteTable);
    });

    // Handle VPC peering connection
    if (props.vpcPeering) {
      const { peerVpcId, peerCidr } = props.vpcPeering;

      const peeringConnection = new ec2.CfnVPCPeeringConnection(this, "VpcPeeringConnection", {
        vpcId: this.vpc.vpcId,
        peerVpcId: peerVpcId,
      });

      const allRouteTables = [publicRouteTable, ...privateRouteTables];
      allRouteTables.forEach((routeTable, index) => {
        new ec2.CfnRoute(this, `PeeringRoute-${index + 1}`, {
          routeTableId: routeTable.ref,
          destinationCidrBlock: peerCidr,
          vpcPeeringConnectionId: peeringConnection.ref,
        });
      });
    }

    // Handle Transit Gateway attachment
    if (props.transitGateway) {
      const { tgwId, spokeVpcCidrs } = props.transitGateway;

      const tgwAttachment = new ec2.CfnTransitGatewayAttachment(this, "TransitGatewayAttachment", {
        transitGatewayId: tgwId,
        vpcId: this.vpc.vpcId,
        subnetIds: publicSubnets.map((subnet) => subnet.subnetId),
      });

      const allRouteTables = [publicRouteTable, ...privateRouteTables];
      allRouteTables.forEach((routeTable, index) => {
        spokeVpcCidrs.forEach((spokeCidr, routeIndex) => {
          new ec2.CfnRoute(this, `TransitGatewayRoute-${index + 1}-${routeIndex + 1}`, {
            routeTableId: routeTable.ref,
            destinationCidrBlock: spokeCidr,
            transitGatewayId: tgwId,
          });
        });
      });
    }
  }
}
