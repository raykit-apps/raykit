/**
 * Superpowers plugin for OpenCode.ai
 *
 * Injects superpowers bootstrap context via system prompt transform.
 * Skills are discovered via OpenCode's native skill tool from symlinked directory.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Simple frontmatter extraction (avoid dependency on skills-core for bootstrap)
function extractAndStripFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match)
    return { frontmatter: {}, content }

  const frontmatterStr = match[1]
  const body = match[2]
  const frontmatter = {}

  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim()
      const value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '')
      frontmatter[key] = value
    }
  }

  return { frontmatter, content: body }
}

export async function SuperpowersPlugin() {
  const superpowersSkillsDir = path.resolve(__dirname, '../skills')

  // Helper to generate bootstrap content
  const getBootstrapContent = () => {
    // Try to load using-superpowers skill
    const skillPath = path.join(superpowersSkillsDir, 'using-superpowers', 'SKILL.md')
    if (!fs.existsSync(skillPath))
      return null

    const fullContent = fs.readFileSync(skillPath, 'utf8')
    const { content } = extractAndStripFrontmatter(fullContent)

    const toolMapping = `**Tool Mapping for OpenCode:**
When skills reference tools you don't have, substitute OpenCode equivalents:
- \`TodoWrite\` → \`update_plan\`
- \`Task\` tool with subagents → Use OpenCode's subagent system (@mention)
- \`Skill\` tool → OpenCode's native \`skill\` tool
- \`Read\`, \`Write\`, \`Edit\`, \`Bash\` → Your native tools

**Skills location:**
Superpowers skills are in \`.opencode/skills/\`
Use OpenCode's native \`skill\` tool to list and load skills.`

    return `<EXTREMELY_IMPORTANT>
You have superpowers.

**IMPORTANT: The using-superpowers skill content is included below. It is ALREADY LOADED - you are currently following it. Do NOT use the skill tool to load "using-superpowers" again - that would be redundant.**

${content}

${toolMapping}

Hard Rule: Once a skill is invoked, execution must strictly adhere to the defined description of that skill. No unauthorized extensions or operations outside the defined scope are permitted.
</EXTREMELY_IMPORTANT>`
  }

  return {
    // Use system prompt transform to inject bootstrap (fixes #226 agent reset bug)
    'experimental.chat.system.transform': async (_input, output) => {
      const bootstrap = getBootstrapContent()
      if (bootstrap) {
        (output.system ||= []).push(bootstrap)
      }
    },
  }
}
