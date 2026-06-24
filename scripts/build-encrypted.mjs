// 客户端加密简历页：把简历内容用口令做 AES 加密，访客在浏览器里输对口令才解密渲染。
// 爬虫/脚本抓到的只是密文，没口令拿不到任何内容。用成熟的 StatiCrypt 做加密。
//
// 运行：  node scripts/build-encrypted.mjs        （或 pnpm encrypt）
//        口令默认 lijianglei，可用环境变量覆盖：RESUME_PW=xxx pnpm encrypt
// 产物：  encrypted/index.html —— 部署到「公开」仓库（只含密文）；
//        明文中间产物写在 .enc-tmp/ 并即时删除，绝不入库 / 不部署。
import { buildResumeHtml } from "./resume-html.mjs";
import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PW = process.env.RESUME_PW || "lijianglei";

// 1) 把明文 HTML 写到一个临时目录（之后立刻删，绝不提交/部署）
const srcDir = join(ROOT, ".enc-tmp");
rmSync(srcDir, { recursive: true, force: true });
mkdirSync(srcDir, { recursive: true });
writeFileSync(join(srcDir, "index.html"), buildResumeHtml("zh"));

// 2) StatiCrypt 加密 → encrypted/index.html
//    -c false 不读写配置文件；--short 隐藏「弱口令」提示；--remember false 去掉「记住我」勾选
const outDir = join(ROOT, "encrypted");
rmSync(outDir, { recursive: true, force: true });
execFileSync(
  "npx",
  ["staticrypt", join(srcDir, "index.html"), "-p", PW, "-c", "false", "-d", outDir, "--short", "--remember", "false"],
  { stdio: "inherit", cwd: ROOT }
);

// 3) 删掉明文中间产物
rmSync(srcDir, { recursive: true, force: true });
console.log(`\n✓ 加密页：encrypted/index.html（口令：${PW}）`);
