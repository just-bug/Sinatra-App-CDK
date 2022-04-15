#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SinatraStack } from '../lib/cdk-stack';
import * as config from './configuration' 

const app = new cdk.App();

config.accounts.forEach((account) => {
  new SinatraStack(app, account.name + 'SinatraStack', {
    appName: config.appName,
    env: account.env,
    az: account.az,
    instance: config.ec2inst,
    sgRules: config.sgRules,
    cidr: account.cidr,
    cfninitAssets: config.cfninitAssets,
    cfninitCommands: config.cfninitCommands
  });
})