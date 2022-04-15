# Simple Sinatra App - Documentation

This document describes the implementation of the Simple Sinatra App. The purpose of the application is to display 'Hello World!' when visiting the public DNS of the EC2 instance. The instance is running Rack to hosting a lightweight web application with Ruby. The solution is built and is deployed via AWS CDK.

# Assumptions
Listed are the assumptions made when building the infrastructure:

- The server is to be hosted in a new VPC with a CIDR of 10.0.0.0/28 (smallest available on AWS).
- The VPC only has one public subnet.
- The server is hosted on AZ ap-southeast-2a for latency.
- The server is running on a small 'free-tier' T2 Micro for cost efficiency.
- The server is running on a lightweight 'free-tier' Amazon Linux 2 AMI.
- The server is to be used in a public subnet for internet access.
  - As opposed to sitting behind a Load Balancer in a private subnet, this solution is not 'best-practice' but will cut down on paying for a bastion host as well as a load balancer.

# File Structure

The file structure is as follows:

```
SinatraCDK
│   README.md
|
└───simple-sinatra-app
│   │   config.ru
│   │   Gemfile
|   |	Gemfile.lock
|   |	helloworld.rb
|   |	init.sh
│   │
│   └───cdk
│       │   
│   	└──bin
|	   |	cdk.ts
|	   |	configuration.ts
|	   |
│   	└──lib
|	   |	cdk-stack.ts
|	   |	props.ts
|	   |
| 	└──cdk.out
|	   |	*.json
|	   | 
```

- The cdk folder structure stores all the infrastructure IaC configuration.
- The cdk.out folder contains the compiled CloudFormation json template to be deployed.
- The bin folder stores the entry point of the CDK application 'cdk.ts'. It loads the stack defined in 'lib/cdk-stack.ts'.
- The configuration.ts file in bin/ stores any variable configuration for this project so you are able to define account, region, userdata, EC2 sizing, ami... etc.
- The props.ts file in lib/ stores the interfaces for the 'SinatraStackProps'.

# Deployment

## Pre-requisites

- AWS CDK v2 needs to be installed on your machine, this is done via NPM.
-- Install the AWS CDK Toolkit globally using the following Node Package Manager command:
`npm install -g aws-cdk`

- Your AWS account and region needs to be bootstrapped, run the following CDK command (replacing ACCOUNT-NUMBER and REGION):
`cdk bootstrap aws://ACCOUNT-NUMBER/REGION`

- You must configure your workstation with your credentials and an AWS region, if you have not already done so. If you have the AWS CLI installed, the easiest way to satisfy this requirement is issue the following command:
`aws configure`

NOTE: Make sure the ACCOUNT-NUMBER and REGION for the above steps are the same as defined in the configuration.ts file.

For more information visit:
https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html

## Steps to deploy

1. Log onto your AWS console and create 'SinatraKP.pem' PEM key pair in the EC2 console, store this securely and run `chmod 400 SinatraKP.pem` on the file.
2. Edit the configuration.ts with your required configuration. The following parameters will need to change based on your deployment:

	* **accounts** - Change name, account, region, cidr and az to your desired values.
	* **sgRules** - Change ingress rule 'SSH from your IP' to reflect your IP address for access to the instance.
 
3. Navigate to simple-sinatra-app/cdk.
4. Run the following command to make sure all dependencies are installed:
`npm install`
5. [OPTIONAL] Run the following command to verify what changes will be deployed to your AWS account:
`cdk diff`
7. Run the following command to deploy the infrastructure:
`cdk deploy`
6. Once the infrastructure is deployed, cd to the directory with your key pair and ssh into the EC2 instance using ec2-user and the public IP/DNS (this will display as an output on the cli post-deployment)
example: `ssh -i "SinatraKP.pem" ec2-user@ec2-54-206-53-245.ap-southeast-2.compute.amazonaws.com`
7. Run `sudo -i` to switch to root then run `/root/init.sh`. This will run Rack to deploy the web application.
8. The application should now be accessible over HTTP when visiting the ec2 public DNS.

# Improvements

- CDK constructs could be utilised to make the cdk code more reusable and to easily change configuration.
- For security best practice, the server should be deployed in a private subnet behind a load balancer and with a bastion host for ssh access.
- The solution isn't fully automated as there is a manual step to run the init.sh script, I wasn't able to figure out a way to run the commands via userdata/cfn-init but maybe a lambda or pipeline step could be utilised to run the script post deployment.
- A pipeline using a service account could be created for a more simplified/automated deployment.
- The VPC is created with a CIDR of 10.0.0.0/28 (smallest available), no NAT Gateways (since it's deployed in a public subnet), 1 public subnet, and no private subnet. This is done for cost reduction. If the VPC is to be used for more than just a simple sinatra application, high availability is required, or the application is to be moved to a private subnet then this config should be changed to include NAT Gateways and/or more subnets.
- The public cidr uses the whole VPC cidr range available so this will also need to change if a private subnet is introduced.
