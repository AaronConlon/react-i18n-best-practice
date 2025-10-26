#!/usr/bin/env node
/**
 * 检查 /locales/en/*.json 是否在其他语言下都有对应文件，
 * 并确保 JSON key 一致。
 */
import fs from "fs"
import path from "path"

const BASE_LANG = "en"
const LOCALES_DIR = path.resolve("./public/locales")

function getAllLangs() {
  return fs
    .readdirSync(LOCALES_DIR)
    .filter((f) => fs.statSync(path.join(LOCALES_DIR, f)).isDirectory())
}

function loadJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8")
    return JSON.parse(content)
  } catch (e) {
    console.error(`❌ 无法解析 JSON 文件：${filePath}`)
    process.exit(1)
  }
}

function getJsonKeys(obj, prefix = "") {
  let keys = []
  for (const key in obj) {
    const full = prefix ? `${prefix}.${key}` : key
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys = keys.concat(getJsonKeys(obj[key], full))
    } else {
      keys.push(full)
    }
  }
  return keys
}

// ----------------- 主逻辑 -----------------
const langs = getAllLangs()
if (!langs.includes(BASE_LANG)) {
  console.error(`❌ 缺少基准语言目录：${BASE_LANG}`)
  process.exit(1)
}

const baseFiles = fs
  .readdirSync(path.join(LOCALES_DIR, BASE_LANG))
  .filter((f) => f.endsWith(".json"))

let hasError = false

for (const lang of langs.filter((l) => l !== BASE_LANG)) {
  console.log(`🔍 检查语言：${lang}`)

  for (const file of baseFiles) {
    const baseFile = path.join(LOCALES_DIR, BASE_LANG, file)
    const targetFile = path.join(LOCALES_DIR, lang, file)

    if (!fs.existsSync(targetFile)) {
      console.error(`❌ 缺少 ${lang}/${file}`)
      hasError = true
      continue
    }

    const baseJson = loadJson(baseFile)
    const targetJson = loadJson(targetFile)

    const baseKeys = getJsonKeys(baseJson)
    const targetKeys = getJsonKeys(targetJson)

    const missing = baseKeys.filter((k) => !targetKeys.includes(k))
    const extra = targetKeys.filter((k) => !baseKeys.includes(k))

    if (missing.length || extra.length) {
      console.error(`❌ ${lang}/${file} 键不一致:`)
      if (missing.length)
        console.error(`   缺少：${missing.join(", ")}`)
      if (extra.length)
        console.error(`   多余：${extra.join(", ")}`)
      hasError = true
    }
  }
}

if (hasError) {
  console.error("\n🚫 多语言文件结构不一致，请修复后再提交。")
  process.exit(1)
}

console.log("✅ 多语言文件检查通过！")
process.exit(0)
