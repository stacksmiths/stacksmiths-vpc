import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "../../src/vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "HaVpcStack");

new StacksmithsVpc(stack, "HighAvailabilityVpc", {
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

app.synth();
