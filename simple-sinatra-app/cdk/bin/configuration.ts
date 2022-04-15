import { InstanceClass, InstanceSize, Peer, Port } from "aws-cdk-lib/aws-ec2"

export const appName = 'Simple-Sinatra-App'

export enum SGDirection {
    ingress = 'ingress',
    egress = 'egress'
}

export const accounts = [
    {
        name: 'NonProd',
        env: {
            account: '087901013023',
            region: 'ap-southeast-2'
        },
        az: ['ap-southeast-2a'], // Only 1 AZ configured (chosen in sorted order so 'a' will be first)
        cidrMask: "28",
        cidrIp: "10.0.0.0",
        maxAzs: 1,
        natGws: 0
    }
]

const userData = 
`yum install -y aws-cfn-bootstrap
yum install -y ruby24
alternatives --set ruby /usr/bin/ruby2.4
gem install bundler`

export const ec2inst = 
    {
        name: 'simple-sinatra-app',
        ec2Key: 'SinatraKP', // Created in console
        instanceClass: InstanceClass.T2,
        InstanceSize: InstanceSize.MICRO,
        userData: userData,
    }

export const sgRules = [
    {
        direction: SGDirection.ingress,
        ip: Peer.ipv4('122.110.135.48/32'),
        port: Port.tcp(22),
        decription: 'SSH from your IP'
    },
    {
        direction: SGDirection.ingress,
        ip: Peer.ipv4('0.0.0.0/0'),
        port: Port.tcp(80),
        decription: 'HTTP from anywhere'
    }
]

export const cfninitAssets = [
    {
        name: '/root/config.ru',
        path: '../config.ru'
    },
    {
        name: '/root/Gemfile',
        path: '../Gemfile'
    },
    {
        name: '/root/helloworld.rb',
        path: '../helloworld.rb'
    },
    {
        name: '/root/init.sh',
        path: '../init.sh'
    } 
]

export const cfninitCommands = [
    'chmod +x /root/init.sh'
]