import * as sm from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { randomBytes} from "crypto";

interface Event {
    SecretId: string,
    ClientRequestToken: string,
    Step: 'CreateSecret' | 'UpdateSecret' | 'setSecret' | 'testSecret' | 'finishSecret'
};

export async function handler(event: Event):Promise<APIGatewayProxyResult> {
    const secretManager = new sm.SecretsManager();
    const secretValue = await secretManager.getSecretValue({
        SecretId: process.env.SECRET2_NAME || " "
    }).promise();
    console.log("secret2_value =", secretValue);

    if(event.Step ==='CreateSecret'){
        await secretManager.putSecretValue({
            SecretId: process.env.SECRET2_NAME || " ",
            SecretString: JSON.stringify({
                [process.env.SECRET2_KEY_VALUE || ""]:randomBytes(32).toString("hex")
            }),
            VersionStages: ['AWSCURRENT']
        }).promise();
    }

    return {
        statusCode: 200,
        headers: {"Content-Type": "text/plain"},
        body: `Hello, CDK! You're hit ${process.env.SECRET || ""}\n`
    }
    
}