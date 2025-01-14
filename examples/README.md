# Examples

This directory contains usage examples for the `StacksmithsVpc` module. Each example demonstrates a specific use case.

1. **[Basic VPC](basic-vpc/app.ts)**: A simple VPC with public and private subnets.
2. **[High Availability VPC](high-availability/app.ts)**: A highly available VPC across multiple AZs.
3. **[Private VPC](private-vpc/app.ts)**: A VPC with only private subnets.
4. **[VPC with Peering](vpc-peering/app.ts)**: Connect two VPCs using VPC peering.
5. **[Transit Gateway](transit-gateway/app.ts)**: A centralized VPC connected via a Transit Gateway.
6. **[Isolated Subnets](isolated-subnets/app.ts)**: VPC with isolated subnets for workloads without internet access.

## Running Examples

1. Navigate to the desired example directory:

   ```bash
   cd examples/basic-vpc
   ```

2. Install Dependencies (if not already installed):

   ```bash
   npm install
   ```

3. Synthesize the CloudFormation Template:

   ```bash
   cdk synth --app "npx ts-node app.ts"
   ```

4. Deploy the Stack to AWS:

   ```bash
   cdk deploy --app "npx ts-node app.ts"
   ```

5. Destroy the Deployed Stack (when no longer needed):

   ```bash
   cdk destroy --app "npx ts-node app.ts"
   ```
