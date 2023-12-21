$version: "2.0"

namespace nuxt3cdkexample

use aws.protocols#restJson1
use aws.apigateway#requestValidator
use aws.apigateway#integration

/// Provides a friendly greeting from a AWS API Gateway deployed REST API
@restJson1
@requestValidator("full")
@title("SmithyCdkExample API")
service SmithyCdkExample {
    version: "2023-12-12"
    operations: [SayHi, SayBye]
}

@input
structure SayHiInput {
    @required
    @httpQuery("name")
    name: String
}

@output
structure SayHiOutput {
    @required
    greeting: String
}

@output
structure SayByeOutput {
    @required
    farewell: String
}

@input
structure SayByeInput {
    @required
    @httpQuery("name")
    name: String

    @required
    @httpQuery("salutation")
    salutation: String
}

@readonly
@http(method: "GET", uri: "/hi")
@integration(
    type: "aws_proxy",
    uri: "${SayHiLambda}",
    httpMethod: "POST"
)
operation SayHi {
    input: SayHiInput
    output: SayHiOutput
}

@readonly
@http(method: "GET", uri: "/bye")
@integration(
    type: "aws_proxy",
    uri: "${SayByeLambda}",
    httpMethod: "POST"
)
operation SayBye {
    input: SayByeInput
    output: SayByeOutput
}
