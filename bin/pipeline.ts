#!/usr/bin/env node
import "source-map-support/register";
import { PipelineStack } from "../lib/pipeline-stack";
import { BillingStack } from "../lib/billing-stack";
import { ServiceStack } from "../lib/service-stack";
import { App, Environment } from "aws-cdk-lib";
import { IStage } from "aws-cdk-lib/aws-apigateway";

const usEast1Env: Environment = {
  account: "107788087125",
  region: "us-east-1",
};

const euWest1Env: Environment = {
  account: "107788087125",
  region: "eu-west-1",
};

const account2Env: Environment = {
  account: "862494862178",
  region: "us-east-1",
};

const app = new App();
const pipelineStack = new PipelineStack(app, "PipelineStack", {
  env: usEast1Env,
});
const billingStack = new BillingStack(app, "BillingStack", {
  env: usEast1Env,
  budgetAmount: 5,
  emailAddress: "zaid.shamim@sureter.com",
});

const serviceStackTest = new ServiceStack(app, "ServiceStackTest", {
  env: usEast1Env,
  stageName: "Test",
});

const serviceStackTest2 = new ServiceStack(app, "ServiceStackTest2", {
  env: account2Env,
  stageName: "Test",
});

const serviceStackProd = new ServiceStack(app, "ServiceStackProd", {
  env: usEast1Env,
  stageName: "Prod",
});

const serviceStackProdBackup = new ServiceStack(app, "ServiceStackProdBackup", {
  env: euWest1Env,
  stageName: "Prod",
});

const testStage = pipelineStack.addServiceStage(serviceStackTest, "Test");
pipelineStack.addServiceStage(serviceStackTest2, "CrossAccountTest");
const prodStage = pipelineStack.addServiceStage(serviceStackProd, "Prod");
pipelineStack.addServiceStage(serviceStackProdBackup, "ProdBackup");

pipelineStack.addBillingStackToStage(billingStack, prodStage);
pipelineStack.addServiceIntegrationTestToStage(
  testStage,
  serviceStackTest.serviceEndpointOutput.toString()
);
