/**
 * @enum number
 */
export const State = {
  TopLevelContent: 1,
  InsideDoubleQuoteString: 2,
  InsideLineComment: 3,
  AfterInclude: 4,
  AfterIncludeAfterWhitespace: 5,
  AfterMacroError: 6,
  AfterMacroErrorAfterWhitespace: 7,
  InsideBlockComment: 8,
}

/**
 * @enum number
 */
export const TokenType = {
  None: 901,
  Whitespace: 0,
  PlainText: 117,
  Comment: 60,
  String: 50,
  Numeric: 30,
  Text: 117,
  TagName: 118,
  Punctuation: 10,
  Error: 141,
  NewLine: 771,
  Keyword: 951,
  VariableName: 952,
  Include: 222,
  Type: 555,
  Macro: 71,
}

export const TokenMap = {
  [TokenType.Whitespace]: 'Whitespace',
  [TokenType.Keyword]: 'Keyword',
  [TokenType.PlainText]: 'PlainText',
  [TokenType.Comment]: 'Comment',
  [TokenType.Text]: 'Text',
  [TokenType.Punctuation]: 'Punctuation',
  [TokenType.VariableName]: 'VariableName',
  [TokenType.Include]: 'KeywordImport',
  [TokenType.String]: 'String',
  [TokenType.Type]: 'Type',
  [TokenType.Macro]: 'Macro',
  [TokenType.Numeric]: 'Numeric',
}

const RE_WHITESPACE = /^\s+/
const RE_WHITESPACE_SINGLE_LINE = /^( |\t)+/
const RE_WHITESPACE_NEWLINE = /^\n/
const RE_CONSTANT = /^(true|false|null)/
const RE_STRING_DOUBLE_QUOTE_CONTENT = /^[^"\n]+/
const RE_STRING_SINGLE_QUOTE_CONTENT = /^[^'\n]+/
const RE_DOUBLE_QUOTE = /^"/
const RE_CURLY_OPEN = /^\{/
const RE_CURLY_CLOSE = /^\}/
const RE_SQUARE_OPEN = /^\[/
const RE_SQUARE_CLOSE = /^\]/
const RE_COMMA = /^,/
const RE_COLON = /^:/
const RE_NUMERIC =
  /^((0(x|X)[0-9a-fA-F]*)|(([0-9]+\.?[0-9]*)|(\.[0-9]+))((e|E)(\+|-)?[0-9]+)?)/
const RE_NEWLINE_WHITESPACE = /^\n\s*/
const RE_BLOCK_COMMENT_START = /^\/\*/
const RE_BLOCK_COMMENT_CONTENT_1 = /^.+(?=\*\/)/s
const RE_BLOCK_COMMENT_CONTENT_2 = /^.+(?=$)/s
const RE_BLOCK_COMMENT_END = /^\*\//
const RE_UNKNOWN_VALUE = /^[^\}\{\s,"]+/
const RE_IMPORT = /^[a-zA-Z\.]+/
const RE_SEMICOLON = /^;/
const RE_VARIABLE_NAME = /^[a-zA-Z\_][a-zA-Z\_\d]*/
const RE_LINE_COMMENT = /^\/\//
const RE_ROUND_OPEN = /^\(/
const RE_ROUND_CLOSE = /^\)/
const RE_DOT = /^\./
const RE_EQUAL_SIGN = /^=/
const RE_SINGLE_QUOTE = /^'/
const RE_PUNCTUATION = /^[\(\)=\+\-><\.,\/\*\^\[\]\{\}\|:\;]/
const RE_ANYTHING_UNTIL_END = /^.+/s
const RE_START_OF_FUNCTION = /^( )*\(/
const RE_COLON_COLON = /^::/
const RE_BASH_SLASH = /^\\/
const RE_ANY_CHAR = /^./
const RE_SQUARE_OPEN_SQUARE_OPEN = /^\[\[/
const RE_SQUARE_CLOSE_SQUARE_CLOSE = /^\]\]/
const RE_STRING_MULTILINE_CONTENT = /^.+?(?=\]\]|$)/s
const RE_KEYWORD =
  /^(?:while|volatile|void|virtual|unsigned|union|using|typedef|try|throw|this|template|switch|struct|static|sizeof|signed|short|return|register|public|protected|private|operator|new|namespace|long|int|inline|if|goto|friend|for|float|extern|enum|else|double|do|delete|default|continue|const|constexpr|class|char|catch|case|bool|break|auto|asm)\b/
const RE_TEXT = /^.+/s
const RE_INCLUDE = /^#include/
const RE_INCLUDE_WITH_QUOTES = /^"([^"]*)"/
const RE_INCLUDE_WITH_ANGLE_BRACKETS = /^<[^>]*>/
const RE_TYPE = /^(?:size_t)\b/
const RE_MACRO = /^#[a-z]+/

export const initialLineState = {
  state: State.TopLevelContent,
}

export const hasArrayReturn = true

// @ts-ignore
export const isLineStateEqual = (lineStateA, lineStateB) => {
  return lineStateA.state === lineStateB.state
}

/**
 *
 * @param {string} line
 * @param {any} lineState
 * @returns
 */
export const tokenizeLine = (line, lineState) => {
  let next = null
  let index = 0
  let tokens = []
  let token = TokenType.None
  let state = lineState.state
  while (index < line.length) {
    const part = line.slice(index)
    switch (state) {
      case State.TopLevelContent:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.TopLevelContent
        } else if ((next = part.match(RE_KEYWORD))) {
          token = TokenType.Keyword
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TYPE))) {
          token = TokenType.Type
          state = State.TopLevelContent
        } else if ((next = part.match(RE_VARIABLE_NAME))) {
          token = TokenType.VariableName
          state = State.TopLevelContent
        } else if ((next = part.match(RE_MACRO))) {
          const macro = next[0]
          switch (macro) {
            case '#include':
              token = TokenType.Include
              state = State.AfterInclude
              break
            case '#error':
              token = TokenType.Macro
              state = State.AfterMacroError
              next
              break
            default:
              token = TokenType.Macro
              state = State.TopLevelContent
              break
          }
        } else if ((next = part.match(RE_LINE_COMMENT))) {
          token = TokenType.Comment
          state = State.InsideLineComment
        } else if ((next = part.match(RE_BLOCK_COMMENT_START))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_PUNCTUATION))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_NUMERIC))) {
          token = TokenType.Numeric
          state = State.TopLevelContent
        } else if ((next = part.match(RE_TEXT))) {
          token = TokenType.Text
          state = State.TopLevelContent
        } else {
          part //?
          throw new Error('no')
        }
        break
      case State.AfterInclude:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterIncludeAfterWhitespace
        } else {
          throw new Error('no')
        }
        break
      case State.AfterIncludeAfterWhitespace:
        if ((next = part.match(RE_INCLUDE_WITH_ANGLE_BRACKETS))) {
          token = TokenType.String
          state = State.TopLevelContent
        } else if ((next = part.match(RE_INCLUDE_WITH_QUOTES))) {
          token = TokenType.String
          state = State.TopLevelContent
        } else {
          console.log({ line: part })
          throw new Error('no')
        }
        break
      case State.InsideLineComment:
        if ((next = part.match(RE_TEXT))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.AfterMacroError:
        if ((next = part.match(RE_WHITESPACE))) {
          token = TokenType.Whitespace
          state = State.AfterMacroErrorAfterWhitespace
        } else {
          throw new Error('no')
        }
        break
      case State.AfterMacroErrorAfterWhitespace:
        if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.String
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      case State.InsideBlockComment:
        if ((next = part.match(RE_BLOCK_COMMENT_END))) {
          token = TokenType.Comment
          state = State.TopLevelContent
        } else if ((next = part.match(RE_BLOCK_COMMENT_CONTENT_1))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_BLOCK_COMMENT_CONTENT_2))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else if ((next = part.match(RE_ANYTHING_UNTIL_END))) {
          token = TokenType.Comment
          state = State.InsideBlockComment
        } else {
          throw new Error('no')
        }
        break
      case State.InsideDoubleQuoteString:
        if ((next = part.match(RE_STRING_DOUBLE_QUOTE_CONTENT))) {
          token = TokenType.String
          state = State.InsideDoubleQuoteString
        } else if ((next = part.match(RE_DOUBLE_QUOTE))) {
          token = TokenType.Punctuation
          state = State.TopLevelContent
        } else {
          throw new Error('no')
        }
        break
      default:
        state
        throw new Error('no')
    }
    const tokenLength = next[0].length
    index += tokenLength
    tokens.push(token, tokenLength)
  }
  return {
    state,
    tokens,
  }
}
