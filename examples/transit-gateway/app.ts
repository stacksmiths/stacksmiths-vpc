import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../../src/vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "TransitGatewayExample");

// Hub VPC
new StacksmithsVpc(stack, "HubVpc", {
  cidr: "10.0.0.0/16",
  publicSubnets: [
    { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
    { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  privateSubnets: [
    { cidr: "10.0.3.0/24", availabilityZone: "ap-southeast-2a" },
    { cidr: "10.0.4.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  transitGateway: {
    tgwId: "tgw-12345678", // Replace with actual Transit Gateway ID
    spokeVpcCidrs: ["10.1.0.0/16", "10.2.0.0/16"],
  },
});

// Spoke VPC A
new StacksmithsVpc(stack, "SpokeVpcA", {
  cidr: "10.1.0.0/16",
  publicSubnets: [
    { cidr: "10.1.1.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  privateSubnets: [
    { cidr: "10.1.2.0/24", availabilityZone: "ap-southeast-2a" },
  ],
});

// Spoke VPC B
new StacksmithsVpc(stack, "SpokeVpcB", {
  cidr: "10.2.0.0/16",
  publicSubnets: [
    { cidr: "10.2.1.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  privateSubnets: [
    { cidr: "10.2.2.0/24", availabilityZone: "ap-southeast-2b" },
  ],
});

app.synth();
