import {
  initialLineState,
  tokenizeLine,
  TokenType,
  TokenMap,
} from '../src/tokenizeCpp'

const DEBUG = true

const expectTokenize = (text, state = initialLineState.state) => {
  const lineState = {
    state,
  }
  const tokens = []
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i++) {
    const result = tokenizeLine(lines[i], lineState)
    lineState.state = result.state
    tokens.push(...result.tokens.map((token) => token.type))
    tokens.push(TokenType.NewLine)
  }
  tokens.pop()
  return {
    toEqual(...expectedTokens) {
      if (DEBUG) {
        expect(tokens.map((token) => TokenMap[token])).toEqual(
          expectedTokens.map((token) => TokenMap[token])
        )
      } else {
        expect(tokens).toEqual(expectedTokens)
      }
    },
  }
}

test('empty', () => {
  expectTokenize(``).toEqual()
})

test('whitespace', () => {
  expectTokenize(' ').toEqual(TokenType.Whitespace)
})

test('keywords', () => {
  // see https://www.geeksforgeeks.org/cpp-keywords/
  expectTokenize('asm').toEqual(TokenType.Keyword)
  expectTokenize('auto').toEqual(TokenType.Keyword)
  expectTokenize('break').toEqual(TokenType.Keyword)
  expectTokenize('case').toEqual(TokenType.Keyword)
  expectTokenize('catch').toEqual(TokenType.Keyword)
  expectTokenize('char').toEqual(TokenType.Keyword)
  expectTokenize('class').toEqual(TokenType.Keyword)
  expectTokenize('const').toEqual(TokenType.Keyword)
  expectTokenize('continue').toEqual(TokenType.Keyword)
  expectTokenize('default').toEqual(TokenType.Keyword)
  expectTokenize('delete').toEqual(TokenType.Keyword)
  expectTokenize('do').toEqual(TokenType.Keyword)
  expectTokenize('double').toEqual(TokenType.Keyword)
  expectTokenize('else').toEqual(TokenType.Keyword)
  expectTokenize('enum').toEqual(TokenType.Keyword)
  expectTokenize('extern').toEqual(TokenType.Keyword)
  expectTokenize('float').toEqual(TokenType.Keyword)
  expectTokenize('for').toEqual(TokenType.Keyword)
  expectTokenize('friend').toEqual(TokenType.Keyword)
  expectTokenize('goto').toEqual(TokenType.Keyword)
  expectTokenize('if').toEqual(TokenType.Keyword)
  expectTokenize('inline').toEqual(TokenType.Keyword)
  expectTokenize('int').toEqual(TokenType.Keyword)
  expectTokenize('long').toEqual(TokenType.Keyword)
  expectTokenize('new').toEqual(TokenType.Keyword)
  expectTokenize('operator').toEqual(TokenType.Keyword)
  expectTokenize('private').toEqual(TokenType.Keyword)
  expectTokenize('protected').toEqual(TokenType.Keyword)
  expectTokenize('public').toEqual(TokenType.Keyword)
  expectTokenize('register').toEqual(TokenType.Keyword)
  expectTokenize('return').toEqual(TokenType.Keyword)
  expectTokenize('short').toEqual(TokenType.Keyword)
  expectTokenize('signed').toEqual(TokenType.Keyword)
  expectTokenize('sizeof').toEqual(TokenType.Keyword)
  expectTokenize('static').toEqual(TokenType.Keyword)
  expectTokenize('struct').toEqual(TokenType.Keyword)
  expectTokenize('switch').toEqual(TokenType.Keyword)
  expectTokenize('template').toEqual(TokenType.Keyword)
  expectTokenize('this').toEqual(TokenType.Keyword)
  expectTokenize('throw').toEqual(TokenType.Keyword)
  expectTokenize('try').toEqual(TokenType.Keyword)
  expectTokenize('typedef').toEqual(TokenType.Keyword)
  expectTokenize('union').toEqual(TokenType.Keyword)
  expectTokenize('unsigned').toEqual(TokenType.Keyword)
  expectTokenize('virtual').toEqual(TokenType.Keyword)
  expectTokenize('void').toEqual(TokenType.Keyword)
  expectTokenize('volatile').toEqual(TokenType.Keyword)
  expectTokenize('while').toEqual(TokenType.Keyword)
})

test('extra keywords', () => {
  expectTokenize(`namespace`).toEqual(TokenType.Keyword)
  expectTokenize(`constexpr`).toEqual(TokenType.Keyword)
  expectTokenize(`bool`).toEqual(TokenType.Keyword)
  expectTokenize(`using`).toEqual(TokenType.Keyword)
})

test('extra type keywords', () => {
  expectTokenize('size_t').toEqual(TokenType.Type)
})

test('include - with angle brackets', () => {
  expectTokenize(`#include <util/Printer.hpp>`).toEqual(
    TokenType.Include,
    TokenType.Whitespace,
    TokenType.String
  )
})

test('include - with quotes', () => {
  expectTokenize(`#include "Printer.hpp"`).toEqual(
    TokenType.Include,
    TokenType.Whitespace,
    TokenType.String
  )
})

test('macro - #pragma once', () => {
  expectTokenize(`#pragma once`).toEqual(
    TokenType.Macro,
    TokenType.Whitespace,
    TokenType.VariableName
  )
})

test('macro - #define', () => {
  expectTokenize(`#define X 42`).toEqual(
    TokenType.Macro,
    TokenType.Whitespace,
    TokenType.VariableName,
    TokenType.Whitespace,
    TokenType.Text
  )
})

test('macro - #error', () => {
  expectTokenize(
    `#error I should be able to write single quotes here: Don't make errors`
  ).toEqual(TokenType.Macro, TokenType.Whitespace, TokenType.String)
})
