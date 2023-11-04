# FluentCI for VS Code

The FluentCI extension for VS Code provides a set of commands for interacting with the [FluentCI](https://fluentci.io) Pipelines.

## Getting Started

1. [Setup FluentCI](https://docs.fluentci.io/tutorial-extras/initializing-a-project) in your project if you haven't.
2. Install "FluentCI" extension in VS Code.
3. reload or restart VS Code.

## Requirements

- [FluentCI](https://fluentci.io) 0.6.9 or later
- [Docker](https://www.docker.com/)
- [VS Code](https://code.visualstudio.com/) 1.84 or later
- [Deno](https://deno.com/) 1.37 or later
- [Dagger](https://dagger.io) >= 0.8.x < 0.9.0

## Supported Features

- Initialize a new FluentCI project
- Run a Pipeline
- Show Pipeline Documentation
- Edit Pipeline Documentation
- Run a specific Job
- Run Pipeline directly from the [FluentCI Registry](https://pkg.fluentci.io) without installing it locally

## Commands

This extension contributes the following commands and can be accessed via [Command Palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette):

|command|description|availability|
|---|---|---|
|Fluent CI: Run Current Pipeline...|Run the current Pipeline configured in the workspace|always|
|Fluent CI: Run a Job...|Run a specific Job in the current Pipeline|always|
|Fluent CI: Initialize a New Pipeline...|Initialize the current workspace as a new FluentCI Project|always|
|Fluent CI: Run a Prebuilt Pipeline...|Run a Pipeline directly from the [FluentCI Registry](https://pkg.fluentci.io) without installing it locally|always|
|Fluent CI: Show Current Pipeline Documentation...|Show Documentation for the Current Pipeline|always|
|Fluent CI: Show Pipeline Documentation...|Show Documentation for a Pipeline|always|
|Fluent CI: Edit Current Pipeline Documentation...|Edit Documentation for the Current Pipeline|always|
|Fluent CI: Remove Fluent CI Configuration...|Remove Fluent CI Configuration from the current workspace|always|
|Fluent CI: Run a Job from a Prebuilt Pipeline...|Run a Job from a Pipeline directly from the [FluentCI Registry](https://pkg.fluentci.io) without installing it locally|always|
|Fluent CI: Run Doctor...|Run the FluentCI Doctor|always|

## Menu

User can trigger the following action from the FluentCI Explorer context-menu

|menu|description|
|---|---|
|Run This Pipeline|Run the selected Pipeline|
|Run This Job|Run the selected Job|
|Show Documentation|Show Documentation for the selected Pipeline|

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

This project is licensed under the terms of the MIT open source license. Please refer to [MIT](LICENSE) for the full terms.

**Enjoy!**
