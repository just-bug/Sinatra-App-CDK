import { CfnOutput, Stack } from 'aws-cdk-lib';
import { Instance, InstanceType, Vpc, SubnetType, UserData, SecurityGroup, CloudFormationInit, InitFile, InitConfig, MachineImage, InitCommand, InitElement } from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';
import { SinatraStackProps } from './props';
import { SGDirection } from '../bin/configuration'

export class SinatraStack extends Stack {
  constructor(scope: Construct, id: string, props: SinatraStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, props.appName + '-vpc', {
      cidr: props.cidrIp + "/" + props.cidrMask,
      natGateways: props.natGws,
      maxAzs: props.maxAzs,
      subnetConfiguration: [
        {
          cidrMask: +props.cidrMask,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        }
      ]
    })

    const publicSubnet = vpc.selectSubnets({
      subnetType: SubnetType.PUBLIC,
      availabilityZones: props.az
    })

    const userData = UserData.forLinux();
    userData.addCommands(props.instance.userData)

    const sg = new SecurityGroup(this, props.appName + '-sg', {
      vpc,
      allowAllOutbound: true
    })

    props.sgRules.forEach(sgRule => {
      if (sgRule.direction == SGDirection.ingress) {
        sg.addIngressRule(
          sgRule.ip,
          sgRule.port,
          sgRule.decription
        )
      } else if (sgRule.direction == SGDirection.egress) {
        sg.addEgressRule(
          sgRule.ip,
          sgRule.port,
          sgRule.decription
        )
      }
    })

    const config: InitElement[] = props.cfninitAssets.map((asset => {
      // Prepare the files as ec2 assets
        return InitFile.fromFileInline(asset.name, asset.path)
    }));

    props.cfninitCommands.forEach(command => {
      config.push(InitCommand.shellCommand(command))
    })

    const initConfig = new InitConfig(config)
    const initData = CloudFormationInit.fromConfig(initConfig);
    
    const instance = new Instance(this, props.appName + '-ec2', {
      vpc,
      vpcSubnets: publicSubnet,
      securityGroup: sg,
      instanceType: InstanceType.of(
        props.instance.instanceClass,
        props.instance.InstanceSize
      ),
      init: initData,
      machineImage: MachineImage.latestAmazonLinux(),
      keyName: props.instance.ec2Key, // Created on console
      userData: userData,
    })

    new CfnOutput(this, props.appName + '-publicIp', {
      value: instance.instancePublicIp,
      exportName: props.appName + '-publicIp'
    })
    new CfnOutput(this, props.appName + '-publicDns', {
      value: instance.instancePublicDnsName,
      exportName: props.appName + '-publicDns'
    })
  }
}

