# CONTRIBUTING

First off, thanks for taking the time to contribute! 🎉 😘 ✨

The following is a set of guidelines for contributing to TOAST UI. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

**This open source communicates through English.**

## Table Of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Get in Touch](#how-to-get-in-touch)
- [Branch Organization](#branch-organization)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)
- [First Code Contribution](#first-code-contribution)
- [Code Style Guide](#code-style-guide)
- [Project Structure](#project-structure)
    - [src](#src)
- [Pull Requests](#pull-requests)
  - [Development Workflow](#development-workflow)
  - [Prerequisites](#prerequisites)
  - [1. Initial Setup](#1-initial-setup)
  - [2. Make change from right branch](#2-make-change-from-right-branch)
    - [Checkout a branch](#checkout-a-branch)
  - [3. Test](#3-test)
  - [4. Commit](#4-commit)
  - [5. Yes! Pull request](#5-yes-pull-request)
    - [Title](#title)
    - [Description](#description)
  - [Building specific packages](#building-specific-packages)
  - [Wrapper Development](#wrapper-development)
- [Semantic version](#semantic-version)
- [License](#license)
- [Credits](#credits)

## Code of Conduct

This project and everyone participates in it is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to dl_javascript@nhn.com.

## How to Get in Touch

We communicate through Github [`discussions`](https://github.com/nhn/tui.chart/discussions) and [`issues`](https://github.com/nhn/tui.chart/issues).

- **Discussion**: It is used when to Notice, Question, Feature Request, and Need discussion.
- **Issues**: It is used to report the bug and write specific specifications when actual features need to be developed based on the discussions.

## Branch Organization

Submit all changes directly to the `main` branch. We don’t use separate branches for development or for upcoming releases. We do our best to keep master in good shape, with all tests passing.

Code that lands in main must be compatible with the latest stable release. It may contain additional features, but no breaking changes. We should be able to release a new minor version from the tip of `main` at any time.

## Reporting Bugs

Bugs are tracked as GitHub issues. Search the list and try to reproduce on demo before you create an issue. When you create an issue, please provide the following information by filling in the template.

**It is best to create an example project through [codesandbox](https://codesandbox.io/) or [jsfiddle](https://jsfiddle.net/).**

Explain the problem and include additional details to help maintainers reproduce the problem:

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible. Don't just say what you did, but explain how you did it. For example, if you moved the cursor to the end of a line, explain if you used a mouse or a keyboard.
- **Provide specific examples to demonstrate the steps.** Include links to files or GitHub projects, or Copy-paste-able snippets, which you use in those examples. If you're providing snippets on the issue, use Markdown code blocks.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

## Suggesting Enhancements

In case you want to suggest for TOAST UI Chart, please follow this guideline to help maintainers and the community understand your suggestion.
Before creating suggestions, please check [issues](https://github.com/nhn/tui.chart/issues) and [discussions](https://github.com/nhn/tui.chart/discussions) list if there's already a request.

Create an issue and provide the following information:

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Provide specific examples to demonstrate the steps.** Include Copy-paste-able snippets which you use in those examples, as Markdown code blocks.
- **Include screenshots and animated GIFs** which helps demonstrate the steps or point out the part of TOAST UI Chart which the suggestion is related to.
- **Explain why this enhancement would be useful** to most TOAST UI users.
- **List some other charts or applications where this enhancement exists.**

## First Code Contribution

Unsure where to begin contributing to TOAST UI? You can start by looking through these `good first issue` and `help wanted` issues:

- **good first issue**: issues which should only require a few lines of code, and a test or two.
- **help wanted**: issues which should be a bit more involved than beginner issues.

## Code Style Guide

We use an automatic code formatter called [`Prettier`](https://prettier.io/). Run npm prettier after making any changes to the code.

Then, our linter will catch most issues that may exist in your code. You can check the status of your code styling by simply running `npm run validate`.

However, there are still some styles that the linter cannot pick up. If you are unsure about something, looking at [TOAST UI’s Static Analysis Guide](https://ui.toast.com/fe-guide/en_STATIC-ANALYSIS) and [TOAST UI ESLint config](https://github.com/nhn/tui.eslint.config) will guide you in the right direction.

## Project Structure

TOAST UI Chart is organized as a monorepo using [`Lerna`](https://github.com/lerna/lerna). For lerna command, refer to the following [link](https://github.com/lerna/lerna/tree/main/commands).

```sh
tui.chart
ㄴ apps
|   ㄴ chart                # main application code
|   |   ㄴ src                # refer to below "src" contents
|   |   |   ㄴ brushes
|   |   |   ㄴ charts
|   |   |   ㄴ component
|   |   |   ㄴ css
|   |   |   ㄴ helpers
|   |   |   ㄴ scale
|   |   |   ㄴ store
|   |   ㄴ examples           # examples for API web page
|   |   ㄴ stories            # storybook story files
|   |   ㄴ tests              # test code
|   |   ㄴ types              # exported type
|   ㄴ react-chart          # react wrapper
|   ㄴ vue-chart            # vue wrapper
ㄴ docs                     # guide document
    ㄴ en                     # english guide
    ㄴ ko                     # korean guide
```

### src

We will call the `apps/chart` package as the main application. Let's look at the folder structure of the main application in more detail.

- `brushes`: Contains code related to the canvas used to draw the chart.
- `charts`: Contains the code for each chart type constructor.
- `component`: Contains code for each component that makes up the chart.
- `css`: Contains css files used for charts such as export menu and tooltip.
- `helpers`: Contains helper code for calculating the colors or calculations needed to create the chart.
- `scale`: Contains the code needed to calculate the scale.
- `store`: Contains the code necessary to manage the state of the chart.

## Pull Requests

### Development Workflow

1. Set up your development environment.
2. Make change from right branch.
3. Be sure the code passes test.
4. Commit with convention-keeping message.
5. Make a pull request.

### Prerequisites

Please have the latest stable versions of the following on your machine.

- [node](https://nodejs.org/)

### 1. Initial Setup

```sh
$ git clone https://github.com/nhn/tui.chart.git
$ cd tui.chart
$ npm install
$ npx lerna bootstrap

# link... Take a break ☕︎

$ cd apps/chart
$ npm run serve
```

After that, You must have this running for your changes to show up.

### 2. Make change from right branch

#### Checkout a branch

- **main**: bug fix or document update for next patch release. develop branch will rebase every time main branch update. So keep code change to a minimum.
- **gh-pages**: API docs, examples and demo

### 3. Test

Run Test and verify all the tests pass.

```sh
$ npm run test
```

If you are adding new commands or features, they must include tests. If you are changing functionality, update the tests if you need to. Test code is written in the `.spec.ts` folder in the `tests` path.

If there are any visual changes, you need to add a story to each chart file in the `stories` folder.

```sh
$ npm run storybook
```

Also, you need to check whether the type and style of the code are properly written through the `validate` command.

```sh
$ npm run validate
```

### 4. Commit

Follow our [commit message conventions](./docs/COMMIT_MESSAGE_CONVENTION.md).

### 5. Yes! Pull request

Make your pull request, then describe your changes.

#### Title

Follow other PR title format on below.

```
<Type>: Short Description (fix #111)
<Type>: Short Description (fix #123, #111, #122)
<Type>: Short Description (ref #111)
```

- capitalize first letter of Type
- use present tense: 'change' not 'changed' or 'changes'

#### Description

If it has related to issue, add links to the issues(like `#123`) in the description.
Fill in the [Pull Request Template](./docs/PULL_REQUEST_TEMPLATE) by check your case.

### Building specific packages

If you're working on one or a few packages, for every change that you make, you have to rebuild those packages. To make the process easier, there is a CLI command for that:

```sh
$ npm run build                # build all package
$ npm run build:chart          # build chart package
$ npm run build:react          # build react package
$ npm run build:vue            # build vue package
```

### Wrapper Development

If you need to test `react-wrapper` or `vue-wrapper`, build the main application and proceed with development through the storybook.

```sh
$ npm run build:chart
$ cd apps/react-chart
$ npm run storybook
```

After that, You must have this running for your changes to show up.

## Semantic version

TOAST UI Chart follows [`semantic versioning`](https://semver.org/). We release patch versions for critical bugfixes, minor versions for new features or non-essential changes, and major versions for any breaking changes. When we make breaking changes, we also introduce deprecation warnings in a minor version so that our users learn about the upcoming changes and migrate their code in advance.

When the main application package is updated, the version of the entire package is also updated. However, if only the modification of other packages occurs, only the version of the modified package is updated. When the main application package is updated after that, it is updated based on the highest version among the packages.

Every change is documented in the [Github releases](https://github.com/nhn/tui.chart/releases) link.

## License

By contributing to TOAST UI Chart, you agree that your contributions will be licensed under its [MIT license](https://github.com/nhn/tui.chart/blob/main/LICENSE).

## Credits

Thank you to all the people who have already contributed to TOAST UI Chart!

<a href="https://github.com/nhn/tui.chart/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=nhn/tui.chart" />
</a>

> This Guide is base on [atom](https://github.com/atom/atom/blob/master/CONTRIBUTING.md), [storybook](https://github.com/storybookjs/storybook/blob/next/CONTRIBUTING.md), [React](https://reactjs.org/docs/how-to-contribute.html#style-guide) and [Vue](https://github.com/vuejs/vue/blob/dev/.github/CONTRIBUTING.md) contributing guide.
