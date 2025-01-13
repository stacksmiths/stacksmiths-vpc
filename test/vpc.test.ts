import { Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../src/vpc";

test("Simple VPC with public and private subnets, IGW, and NAT Gateway", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new StacksmithsVpc(stack, "TestVpc", {
    cidr: "10.0.0.0/16",
    publicSubnets: [
      { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
    ],
    privateSubnets: [
      { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
    ],
  });

  const template = Template.fromStack(stack);

  // Validate VPC
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.0.0.0/16",
  });

  // Validate Internet Gateway
  const igwLogicalId = Object.keys(template.findResources("AWS::EC2::InternetGateway"))[0];
  expect(igwLogicalId).toBeDefined();
  template.resourceCountIs("AWS::EC2::InternetGateway", 1);
  template.resourceCountIs("AWS::EC2::VPCGatewayAttachment", 1);

  // Validate public subnet and associated route
  const publicSubnet = Object.entries(template.findResources("AWS::EC2::Subnet")).find(
    ([_, resource]) => resource.Properties.CidrBlock === "10.0.1.0/24"
  );
  expect(publicSubnet).toBeDefined();

  const [publicSubnetLogicalId] = publicSubnet!;
  template.hasResourceProperties("AWS::EC2::Route", {
    DestinationCidrBlock: "0.0.0.0/0",
    GatewayId: { Ref: igwLogicalId },
  });

  // Validate private subnet and associated NAT Gateway
  const privateSubnet = Object.entries(template.findResources("AWS::EC2::Subnet")).find(
    ([_, resource]) => resource.Properties.CidrBlock === "10.0.2.0/24"
  );
  expect(privateSubnet).toBeDefined();

  const natLogicalId = Object.keys(template.findResources("AWS::EC2::NatGateway"))[0];
  expect(natLogicalId).toBeDefined();

  template.hasResourceProperties("AWS::EC2::Route", {
    DestinationCidrBlock: "0.0.0.0/0",
    NatGatewayId: { Ref: natLogicalId },
  });
});

test("Simple VPC with public and private subnets", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new StacksmithsVpc(stack, "TestVpc", {
    cidr: "10.0.0.0/16",
    publicSubnets: [
      { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
    ],
    privateSubnets: [
      { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
    ],
  });

  const template = Template.fromStack(stack);

  // Validate VPC
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "10.0.0.0/16",
  });

  // Validate public subnet
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "10.0.1.0/24",
    MapPublicIpOnLaunch: true,
  });

  // Validate private subnet
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "10.0.2.0/24",
    MapPublicIpOnLaunch: false,
  });

  // Validate NAT Gateway
  const natGateways = Object.keys(template.findResources("AWS::EC2::NatGateway"));
  expect(natGateways.length).toBeGreaterThan(0); // Ensure at least one NAT Gateway is created

  // Validate private route using NAT Gateway
  const routes = Object.entries(template.findResources("AWS::EC2::Route")).filter(
    ([_, resource]) =>
      resource.Properties.DestinationCidrBlock === "0.0.0.0/0" &&
      resource.Properties.NatGatewayId !== undefined
  );
  expect(routes.length).toBeGreaterThan(0); // Ensure private route uses NAT Gateway
});

test("High availability VPC with multiple AZs", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new StacksmithsVpc(stack, "TestVpc", {
    cidr: "192.168.0.0/16",
    publicSubnets: [
      { cidr: "192.168.1.0/24", availabilityZone: "ap-southeast-2a" },
      { cidr: "192.168.2.0/24", availabilityZone: "ap-southeast-2b" },
    ],
    privateSubnets: [
      { cidr: "192.168.3.0/24", availabilityZone: "ap-southeast-2a" },
      { cidr: "192.168.4.0/24", availabilityZone: "ap-southeast-2b" },
    ],
  });

  const template = Template.fromStack(stack);

  // Validate VPC
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "192.168.0.0/16",
  });

  // Validate public subnets
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "192.168.1.0/24",
    MapPublicIpOnLaunch: true,
  });
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "192.168.2.0/24",
    MapPublicIpOnLaunch: true,
  });

  // Validate private subnets
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "192.168.3.0/24",
    MapPublicIpOnLaunch: false,
  });
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "192.168.4.0/24",
    MapPublicIpOnLaunch: false,
  });

  // Validate NAT Gateways
  const natGateways = Object.keys(template.findResources("AWS::EC2::NatGateway"));
  expect(natGateways.length).toBe(2); // Ensure two NAT Gateways are created

  // Validate private routes
  const routes = Object.entries(template.findResources("AWS::EC2::Route")).filter(
    ([_, resource]) =>
      resource.Properties.DestinationCidrBlock === "0.0.0.0/0" &&
      resource.Properties.NatGatewayId !== undefined
  );
  expect(routes.length).toBe(2); // Ensure two private routes use NAT Gateways
});

test("Private VPC without public subnets", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new StacksmithsVpc(stack, "TestVpc", {
    cidr: "172.16.0.0/16",
    privateSubnets: [
      { cidr: "172.16.1.0/24", availabilityZone: "ap-southeast-2a" },
    ],
  });

  const template = Template.fromStack(stack);

  // Validate VPC
  template.hasResourceProperties("AWS::EC2::VPC", {
    CidrBlock: "172.16.0.0/16",
  });

  // Validate private subnet
  template.hasResourceProperties("AWS::EC2::Subnet", {
    CidrBlock: "172.16.1.0/24",
    MapPublicIpOnLaunch: false,
  });

  // Ensure no NAT Gateway is created
  const natGateways = Object.keys(template.findResources("AWS::EC2::NatGateway"));
  expect(natGateways.length).toBe(0);

  // Ensure no routes to external gateways exist
  const routes = Object.entries(template.findResources("AWS::EC2::Route")).filter(
    ([_, resource]) =>
      resource.Properties.DestinationCidrBlock === "0.0.0.0/0" &&
      (resource.Properties.GatewayId || resource.Properties.NatGatewayId)
  );
  console.log("Routes Found:", routes); // Debugging information
  expect(routes.length).toBe(0);
});

test("VPC with Peering", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new StacksmithsVpc(stack, "VpcAWithPeering", {
    cidr: "10.0.0.0/16",
    publicSubnets: [
      { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
    ],
    privateSubnets: [
      { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
    ],
    vpcPeering: {
      peerVpcId: "vpc-12345",
      peerCidr: "10.1.0.0/16",
    },
  });

  const template = Template.fromStack(stack);

  // Find the logical ID of the VPC resource
  const vpcLogicalId = Object.keys(template.findResources("AWS::EC2::VPC"))[0];
  expect(vpcLogicalId).toBeDefined();

  // Validate the peering connection
  template.hasResourceProperties("AWS::EC2::VPCPeeringConnection", {
    VpcId: { Ref: vpcLogicalId },
    PeerVpcId: "vpc-12345",
  });

  // Validate routes for peering
  const routes = Object.entries(template.findResources("AWS::EC2::Route")).filter(
    ([_, resource]) =>
      resource.Properties.DestinationCidrBlock === "10.1.0.0/16" &&
      resource.Properties.VpcPeeringConnectionId
  );
  expect(routes.length).toBeGreaterThan(0); // Ensure at least one peering route exists
});

test("VPC with Transit Gateway", () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TransitGatewayTest");

  new StacksmithsVpc(stack, "HubVpc", {
    cidr: "10.0.0.0/16",
    privateSubnets: [
      { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
      { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2b" },
    ],
    transitGateway: {
      tgwId: "tgw-12345678", // Replace with actual TGW ID
      spokeVpcCidrs: ["10.1.0.0/16", "10.2.0.0/16"],
    },
  });

  const template = Template.fromStack(stack);

  // Dynamically retrieve the VPC logical ID
  const vpcLogicalId = Object.keys(template.findResources("AWS::EC2::VPC"))[0];
  expect(vpcLogicalId).toBeDefined();

  // Validate Transit Gateway Attachment
  template.hasResourceProperties("AWS::EC2::TransitGatewayAttachment", {
    TransitGatewayId: "tgw-12345678",
    VpcId: { Ref: vpcLogicalId },
  });

  // Validate routes for Transit Gateway in private subnets
  const routes = Object.entries(template.findResources("AWS::EC2::Route")).filter(
    ([_, resource]) =>
      resource.Properties.TransitGatewayId === "tgw-12345678" &&
      ["10.1.0.0/16", "10.2.0.0/16"].includes(resource.Properties.DestinationCidrBlock)
  );
  expect(routes.length).toBeGreaterThan(0); // Ensure routes exist for spoke VPCs
});
