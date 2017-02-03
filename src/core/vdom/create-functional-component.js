/* @flow */

import VNode, {
  createTextVNode,
  createEmptyVNode
} from '../vdom/vnode'

import { createElement } from './create-element'
import { resolveInject } from '../instance/inject'
import { resolveSlots } from '../instance/render-helpers/resolve-slots'

import {
  warn,
  isDef,
  camelize,
  validateProp,
  toNumber,
  toString,
  looseEqual,
  emptyObject,
  looseIndexOf
} from '../util/index'

import { renderList } from '../instance/render-helpers/render-list'
import { renderSlot } from '../instance/render-helpers/render-slot'
import { resolveFilter } from '../instance/render-helpers/resolve-filter'
import { checkKeyCodes } from '../instance/render-helpers/check-keycodes'
import { bindObjectProps } from '../instance/render-helpers/bind-object-props'
import { renderStatic, markOnce } from '../instance/render-helpers/render-static'
import { resolveScopedSlots } from '../instance/render-helpers/resolve-slots'

export function createFunctionalComponent (
  Ctor: Class<Component>,
  propsData: ?Object,
  data: VNodeData,
  context: Component,
  children: ?Array<VNode>
): VNode | void {
  const options = Ctor.options
  const props = {}
  const propOptions = options.props

  if (isDef(propOptions)) {
    for (const key in propOptions) {
      props[key] = validateProp(key, propOptions, propsData || {})
    }
  } else {
    if (isDef(data.attrs)) mergeProps(props, data.attrs)
    if (isDef(data.props)) mergeProps(props, data.props)
  }
  // ensure the createElement function in functional components
  // gets a unique context - this is necessary for correct named slot check
  const _context = Object.create(context)
  const h = (a, b, c, d) => createElement(_context, a, b, c, d, true)

  const renderContext: Object = {
    data,
    props,
    children,
    parent: context,
    listeners: data.on || {},
    injections: resolveInject(Ctor.options.inject, context),
    slots: () => resolveSlots(children, context)
  }

  // functional template runtime check
  if (process.env.NODE_ENV !== 'production' && options.template) {
    return warn(
      'Vue templates with functional components are not supported with runtime build.'
    )
  }

  // functional compiled template
  if (options.compiled) {
    renderContext.$slots = renderContext.slots()
    renderContext.$scopedSlots = data.scopedSlots || emptyObject
    renderContext._o = markOnce
    renderContext._n = toNumber
    renderContext._s = toString
    renderContext._l = renderList
    renderContext._q = looseEqual
    renderContext._i = looseIndexOf
    renderContext._f = resolveFilter
    renderContext._k = checkKeyCodes
    renderContext._v = createTextVNode
    renderContext._e = createEmptyVNode
    renderContext._u = resolveScopedSlots
    // Apply context to render helpers
    renderContext._c = (a, b, c, d) => createElement(renderContext, a, b, c, d, false)
    renderContext._t = (a, b, c, d) => renderSlot.call(renderContext, a, b, c, d)
    renderContext._m = (a, b) => renderStatic.call(renderContext, a, b)
    renderContext._b = (a, b, c, d) => bindObjectProps.call(renderContext, a, b, c, d)

    // Add static nodes
    renderContext._staticTrees = []
    const staticRenderFns = options.staticRenderFns || []
    for (let i = 0; i < staticRenderFns.length; i++) {
      renderContext._staticTrees.push(staticRenderFns[i](null, renderContext))
    }
  }

  const vnode = options.render.call(null, h, renderContext)
  if (vnode instanceof VNode) {
    vnode.functionalContext = context
    vnode.functionalOptions = options
    if (data.slot) {
      (vnode.data || (vnode.data = {})).slot = data.slot
    }
  }
  return vnode
}

function mergeProps (to, from) {
  for (const key in from) {
    to[camelize(key)] = from[key]
  }
}
