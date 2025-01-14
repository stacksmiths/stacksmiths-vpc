# StacksmithsVpc Module

A reusable AWS CDK construct for creating customizable VPCs with support for public, private, and isolated subnets, as well as advanced configurations like VPC peering and Transit Gateway integration.

---

## Features

- **Custom CIDR Block**: Define the CIDR block for the VPC.
- **Flexible Subnet Configuration**: Configure public, private, and isolated subnets.
- **Region Support**: Deploy the VPC to a specific AWS region.
- **Custom Subnet CIDR Masks**: Set CIDR masks for subnets to control IP allocation.
- **Enable/Disable DNS**: Toggle DNS hostnames and DNS support.
- **Isolated Subnets**: Include isolated subnets for secure workloads.
- **VPC Peering**: Connect multiple VPCs for inter-VPC communication.
- **Transit Gateway Integration**: Centralize connectivity for multiple VPCs.

---

## Installation

### TypeScript/Node.js

Install using npm:

```bash
npm install @stacksmiths/stacksmiths-vpc
```

or using Yarn:

```bash
yarn add @stacksmiths/stacksmiths-vpc
```

### Python

Install using pip:

```bash
pip install @stacksmiths/stacksmiths-vpc
```

### C# / .NET

Install using NuGet:

```bash
dotnet add package StacksmithsVpc
```

### Java

Add the following dependency to your Maven `pom.xml`:

```xml
<dependency>
  <groupId>com.stacksmiths</groupId>
  <artifactId>stacksmiths-vpc</artifactId>
  <version>1.0.0</version>
</dependency>
```

---

## Getting Started

### TypeScript Example

```typescript
import * as cdk from "aws-cdk-lib";
import { StacksmithsVpc } from "stacksmiths-vpc";

const app = new cdk.App();
const stack = new cdk.Stack(app, "ExampleStack");

new StacksmithsVpc(stack, "ExampleVpc", {
  cidr: "10.0.0.0/16",
});
```

### Python Example

```python
from aws_cdk import core
from stacksmiths_vpc import StacksmithsVpc

app = core.App()
stack = core.Stack(app, "ExampleStack")

StacksmithsVpc(stack, "ExampleVpc", {
    "cidr": "10.0.0.0/16",
})
```

### C# / .NET Example

```csharp
using Amazon.CDK;
using StacksmithsVpc;

var app = new App();
var stack = new Stack(app, "ExampleStack");

new StacksmithsVpc(stack, "ExampleVpc", new StacksmithsVpcProps {
    Cidr = "10.0.0.0/16"
});
```

### Java Example

```java
import software.amazon.awscdk.core.*;
import com.stacksmiths.StacksmithsVpc;

public class ExampleApp {
    public static void main(final String[] args) {
        App app = new App();
        Stack stack = new Stack(app, "ExampleStack");

        new StacksmithsVpc(stack, "ExampleVpc", StacksmithsVpcProps.builder()
            .cidr("10.0.0.0/16")
            .build());
    }
}
```

---

### Advanced Configuration

```typescript
new StacksmithsVpc(stack, "AdvancedVpc", {
  cidr: "192.168.0.0/16",
  publicSubnets: [
    { cidr: "192.168.1.0/24", availabilityZone: "ap-southeast-2a" },
    { cidr: "192.168.2.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  privateSubnets: [
    { cidr: "192.168.3.0/24", availabilityZone: "ap-southeast-2a" },
    { cidr: "192.168.4.0/24", availabilityZone: "ap-southeast-2b" },
  ],
  enableDnsHostnames: true,
  enableDnsSupport: true,
});
```

### VPC with Peering

```typescript
new StacksmithsVpc(stack, "VpcWithPeering", {
  cidr: "10.0.0.0/16",
  publicSubnets: [
    { cidr: "10.0.1.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  privateSubnets: [
    { cidr: "10.0.2.0/24", availabilityZone: "ap-southeast-2a" },
  ],
  vpcPeering: {
    peerVpcId: "vpc-12345678", // Replace with the actual peer VPC ID
    peerCidr: "10.1.0.0/16",
  },
});
```

### VPC with Transit Gateway

```typescript
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
```

---

## Inputs

| Property                  | Type               | Default        | Description                                              |
|---------------------------|--------------------|----------------|----------------------------------------------------------|
| `cidr`                   | `string`           | (Required)     | CIDR block for the VPC                                   |
| `publicSubnets`          | `SubnetDefinition[]` | `[]`           | Public subnet definitions                                |
| `privateSubnets`         | `SubnetDefinition[]` | `[]`           | Private subnet definitions                               |
| `enableDnsHostnames`     | `boolean`          | `true`         | Enable DNS hostnames                                     |
| `enableDnsSupport`       | `boolean`          | `true`         | Enable DNS support                                       |
| `vpcPeering`             | `VpcPeeringProps`  | `undefined`    | VPC peering configuration                                |
| `transitGateway`         | `TransitGatewayProps` | `undefined`   | Transit Gateway configuration                            |

---

## Outputs

| Output                | Type            | Description                      |
|-----------------------|-----------------|----------------------------------|
| `vpc.vpcId`          | `string`        | The unique ID of the VPC         |
| `vpc.publicSubnets`  | `ec2.ISubnet[]` | List of public subnets           |
| `vpc.privateSubnets` | `ec2.ISubnet[]` | List of private subnets          |

---

## Contribution Guidelines

### Steps to Contribute

1. **Fork the Repository**: Create a fork of the project repository.
2. **Create a Branch**: Use a feature branch for your changes.

   ```bash
   git checkout -b feature/my-new-feature
   ```

3. **Make Changes**: Implement your feature or bugfix.
4. **Run Tests**: Ensure all tests pass before submitting.

   ```bash
   npm test
   ```

5. **Submit a Pull Request**: Open a pull request with a clear description of your changes.

---

## License

This module is licensed under the MIT License.
