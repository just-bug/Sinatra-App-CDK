import { StackProps } from 'aws-cdk-lib'
import { InstanceClass, InstanceSize, IPeer, Port } from "aws-cdk-lib/aws-ec2"

interface Ec2InstanceProps {
    name: string
    ec2Key: string
    instanceClass: InstanceClass
    InstanceSize: InstanceSize
    userData: string
}

interface SGRuleProps {
    direction: string
    ip: IPeer
    port: Port
    decription: string
}

interface AssetProps {
    path: string
    name: string
}

export interface SinatraStackProps extends StackProps {
    appName: string
    az: string[]
    instance: Ec2InstanceProps
    sgRules: SGRuleProps[]
    cidr: string
    cfninitAssets: AssetProps[]
    cfninitCommands: string[]
}