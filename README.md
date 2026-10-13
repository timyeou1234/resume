# Timothy Yu - Senior iOS Engineer Resume

Personal resume source for Timothy Yu, a Senior iOS Engineer with 10+ years of
experience delivering self-custodial wallets, real-time betting products, and
connected vehicle applications.

## View the resume

- [Portfolio](https://timyeou.com/)
- [Readable resume](https://timyeou1234.github.io/resume/resume.html)
- [US Tech PDF](https://timyeou1234.github.io/resume/assets/us-tech.pdf)
- [Web3 PDF](https://timyeou1234.github.io/resume/assets/web3.pdf)
- [Taiwan PDF](https://timyeou1234.github.io/resume/assets/taiwan.pdf)
- [AI Company PDF](https://timyeou1234.github.io/resume/assets/ai.pdf)
- [Traditional Chinese PDF](https://timyeou1234.github.io/resume/assets/chinese.pdf)

## Resume variants

| Variant | Focus |
| --- | --- |
| US Tech | Product ownership, iOS delivery, architecture, and scale |
| Web3 | Wallet infrastructure, transaction signing, and DeFi integrations |
| Taiwan | Mobile architecture, cross-functional delivery, and local relevance |
| AI Company | AI-assisted engineering, product development, and engineering tools |
| Traditional Chinese | Taiwan-focused Traditional Chinese resume |

All variants share the same reviewed employment history and education. Their
summaries, skill ordering, and positioning change for the intended audience.

## Repository purpose

This is Timothy Yu's personal resume repository. LaTeX sources generate the
five ATS-friendly PDFs, while `source/resume.md` remains the reviewed factual baseline.
`source/resume-public.json` supplies the shared bilingual public copy for the
portfolio resume routes and the readable GitHub Pages version. See
[resume route and source notes](docs/resume-subpath.md) for the candidate workflow.

Every push and pull request builds and validates all PDF variants and checks the
portfolio's local links and JavaScript. A successful build on `main` publishes
the Markdown resume and validated PDFs to GitHub Pages.

`timyeou.com` serves the standalone portfolio directly from Cloudflare. The
Cloudflare bundle contains the portfolio and resume HTML, CSS, JavaScript, and
project media. The GitHub Pages readable resume uses the same public-copy source;
PDFs continue to be built and published separately on GitHub Pages. The `www` hostname serves
the same Cloudflare deployment.

For local setup, repository architecture, build commands, company tailoring,
and release checks, see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

The supporting LaTeX template and build tooling are available under the MIT
License. Personal resume content remains Timothy Yu's.
