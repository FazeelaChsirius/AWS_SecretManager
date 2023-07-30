import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as cdk from "@aws-cdk/core";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";
import * as sm from "@aws-cdk/aws-secretsmanager";
import { Effect } from 'aws-cdk-lib/aws-iam';

export class AwsSecretManagerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    // Create new Sceret in a Stack
    const secret = new sm.Secret(this, "Secret",{
      secretName: "secret"
    });

    const secret_value = sm.Secret.fromSecretAttributes(this, "Secret_value",{
      secretCompleteArn: secret.secretFullArn,
    }).secretValue.unsafeUnwrap.toString();

    const secret2 = new sm.Secret(this, "Secret2",{
      secretName: "MySecretValue",
      generateSecretString:{
        secretStringTemplate: JSON.stringify({}),
        generateStringKey: "Sharjeel_Secret_Key"
      }
    });

    let role = new iam.Role(this,"lambda_role",{
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com")
    });

    const policy = new iam.PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['secretsmanager:*', 'logs:*', 'dynamodb:*'],
      resources: ['*']
    });
    role.addToPolicy(policy);

    const lambdaFn = new lambda.Function(this, "Lambda_Function",{
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      environment:{
        SECRET: secret_value,
        SECRET2_NAME: "MySecretValue",
        SECRET2_KEY_VALUE:  "Sharjeel_Secret_Key"
      },
      memorySize: 1024,
      role
    });

    secret.addRotationSchedule("Rotation_Schedule",{
      rotationLambda: lambdaFn,
      automaticallyAfter: cdk.Duration.days(1)
    });


  }
}
