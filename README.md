`smithy-cdk` is an NPM package that seeks to help use Smithy API model definitions with AWS cloud development kit (CDK) infrastructure code. It is currently in beta. 

### Motivation
Define as much possible about the AWS integration within the Smithy model itself, and subsitute parameters which are not known until deploy time with CDK Tokens. This avoids having to maintain the structure of the API paths both in the Smithy model and within CDK code. Using CDK Tokens inline with the specification file prevents it from having to be staged in S3 as an Asset, reducing deploy time. The dev cycle also benefits from catching errors during synthesis rather than deployment. 

## Usage
View [Get Started](https://kublasean.github.io/smithy-cdk/) on API docs site
