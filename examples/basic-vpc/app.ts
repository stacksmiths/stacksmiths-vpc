import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../../src/vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "BasicVpcExample");

new StacksmithsVpc(stack, "BasicVpc", {
  cidr: "10.0.0.0/16",
  publicSubnets: [{ cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" }],
  privateSubnets: [{ cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" }],
});

app.synth();
