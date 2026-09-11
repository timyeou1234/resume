# Timothy Yu - Senior iOS Engineer Resume

Personal resume source for Timothy Yu, a Senior iOS Engineer with 10+ years of
experience delivering self-custodial wallets, real-time betting products, and
connected vehicle applications.

## View the resume

- [Portfolio and readable web version](https://timyeou.com/)
- [US Tech PDF](https://timyeou.com/assets/us-tech.pdf)
- [Web3 PDF](https://timyeou.com/assets/web3.pdf)
- [Taiwan PDF](https://timyeou.com/assets/taiwan.pdf)
- [AI Company PDF](https://timyeou.com/assets/ai.pdf)
- [Traditional Chinese PDF](https://timyeou.com/assets/chinese.pdf)

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
five ATS-friendly PDFs, while `source/resume.md` supplies the readable GitHub
Pages version and acts as the reviewed factual baseline.

Every push and pull request builds and validates all PDF variants and checks the
portfolio's local links and JavaScript. A successful build on `main` publishes
the Markdown resume and validated PDFs to GitHub Pages.

`timyeou.com` is served by the lightweight Cloudflare Worker in `cloudflare/`.
It maps the custom domain to the GitHub Pages release, so the existing validated
publish workflow remains the single source of deployed website content. The
`www` hostname redirects to the apex domain.

For local setup, repository architecture, build commands, company tailoring,
and release checks, see [DEVELOPMENT.md](DEVELOPMENT.md).

## License

The supporting LaTeX template and build tooling are available under the MIT
License. Personal resume content remains Timothy Yu's.
