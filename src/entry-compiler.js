import { parseComponent } from 'sfc/parser'
import { parse } from 'compiler/parser/index'
import { optimize } from 'compiler/optimizer'
import { generate } from 'compiler/codegen/index'

console.log(parseComponent, parse, optimize, generate)

console.log(parseComponent(`
  <template>
    <div>example</div>
  </template>
`))
