import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../../src/vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "PrivateVpcStack");

new StacksmithsVpc(stack, "PrivateVpc", {
  cidr: "172.16.0.0/16",
  privateSubnets: [
    { cidr: "172.16.1.0/24", availabilityZone: "ap-southeast-2a" },
  ],
});

app.synth();
