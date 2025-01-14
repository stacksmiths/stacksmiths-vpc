import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../../src/vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "VpcPeeringExample");

// VPC A
const vpcA = new StacksmithsVpc(stack, "VpcA", {
  cidr: "10.0.0.0/16",
  publicSubnets: [
    { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  privateSubnets: [
    { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
  ],
});

// VPC B
const vpcB = new StacksmithsVpc(stack, "VpcB", {
  cidr: "10.1.0.0/16",
  publicSubnets: [
    { cidr: "10.1.1.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  privateSubnets: [
    { cidr: "10.1.2.0/24", availabilityZone: "ap-southeast-2b" },
  ],
});

// Add VPC Peering from VPC A to VPC B
new StacksmithsVpc(stack, "VpcAWithPeering", {
  cidr: "10.0.0.0/16",
  publicSubnets: [
    { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  privateSubnets: [
    { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  vpcPeering: {
    peerVpcId: vpcB.vpc.vpcId,
    peerCidr: "10.1.0.0/16",
  },
});

app.synth();
