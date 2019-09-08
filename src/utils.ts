import ansiStyles from 'ansi-styles'
import {EscapeCode} from 'ansi-styles/escape-code'
import * as sections from './sections'
import {Sections} from './types'

const shell = process.argv[3]
export function escapeForShell(ansiCode: string) {
  switch (shell) {
    case 'sh':
    case 'bash':
      return '\x01' + ansiCode + '\x02'
    case 'zsh':
      return '%{' + ansiCode + '%}'
    case 'fish':
      return ansiCode
    default:
      return ansiCode
  }
}

export function escapeForRegex(input: string) {
  return input.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

export const kubernetesBlue: EscapeCode.CodePair = {
  open: `\u001B[38;5;33m`,
  close: `\u001B[39m`,
}

export function color(style: EscapeCode.CodePair, text: string) {
  return `${escapeForShell(style.open)}${text}${escapeForShell(style.close)}`
}

export async function renderPrompt(style: 'prompt' | 'sections' | 'ps2', sectionNames: Sections = []) {
  const promptChar = color(ansiStyles.bold, '❯ ')

  switch (style) {
    case 'prompt':
      return console.log(
        process.argv[4] === '0' ? color(ansiStyles.magenta, promptChar) : color(ansiStyles.red, promptChar),
      )

    case 'ps2':
      return console.log(color(ansiStyles.yellow, promptChar))

    case 'sections':
      const promptParts = await Promise.all(sectionNames.map(section => sections[section]()))
      const prompt = promptParts.filter(part => part !== '')
      return console.log(color(ansiStyles.bold, prompt.join(' ')))

    default:
      throw new Error(`Unknown style: ${style}`)
  }
}

const binaryLocation = process.execPath
const zshInit = `
custom_prompt() {
  exit_code="$?"
  echo ""
  ${binaryLocation} left zsh
  ${binaryLocation} prompt zsh $exit_code
}

custom_rprompt() {
  ${binaryLocation} right zsh
}

custom_ps2() {
  ${binaryLocation} ps2 zsh
}

PROMPT='$(custom_prompt)'
RPROMPT='$(custom_rprompt)'
PS2='$(custom_ps2)'

present() {
  if [ -z "$PROMPT_PRESENTATION_MODE" ]; then
    export PROMPT_PRESENTATION_MODE=1
  else
    unset PROMPT_PRESENTATION_MODE
  fi
}
`.trim()
const bashInit = `
custom_prompt() {
  exit_code="$?"
  echo ""
  PS1=$(printf "%s %s\\n%s" "$(${binaryLocation} left bash)" "$(${binaryLocation} right bash)" "$(${binaryLocation} prompt bash $exit_code)")
  PS2=$(${binaryLocation} ps2 bash)
}
PROMPT_COMMAND=custom_prompt

present() {
  if [ -z "$PROMPT_PRESENTATION_MODE" ]; then
    export PROMPT_PRESENTATION_MODE=1
  else
    unset PROMPT_PRESENTATION_MODE
  fi
}

`.trim()
const fishInit = `
function fish_prompt
  set last_exit $status
  echo ""
  ${binaryLocation} left fish
  ${binaryLocation} prompt fish $last_exit
end

function fish_right_prompt
  ${binaryLocation} right fish
end

function present
  if test "$PROMPT_PRESENTATION_MODE" = "1"
    set -e PROMPT_PRESENTATION_MODE
  else
    set -X PROMPT_PRESENTATION_MODE "1"
  end
end
`.trim()

export async function initPrompt(shell: string) {
  switch (shell) {
    case 'zsh':
      return console.log(zshInit)

    case 'bash':
      return console.log(bashInit)

    case 'fish':
      return console.log(fishInit)

    default:
      throw new Error(`Unknown shell: ${shell}`)
  }
}
