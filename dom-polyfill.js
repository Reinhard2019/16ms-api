import { DOMPoint, DOMMatrix } from 'canvas'
import ResizeObserver from 'resize-observer-polyfill'

globalThis.ResizeObserver = ResizeObserver

// @info
//   DOMRect polyfill
// @src
//   https://drafts.fxtf.org/geometry/#DOMRect
//   https://github.com/chromium/chromium/blob/master/third_party/blink/renderer/core/geometry/dom_rect_read_only.cc
{
  class DOMRect {
    constructor(x = 0, y = 0, width = 0, height = 0) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height
    }

    static fromRect(otherRect) {
      return new DOMRect(otherRect.x, otherRect.y, otherRect.width, otherRect.height)
    }

    get top() {
      return this.y
    }

    get left() {
      return this.x
    }

    get right() {
      return this.x + this.width
    }

    get bottom() {
      return this.y + this.height
    }

    toJSON() {
      return {
        x: this.x,
        y: this.y,
        width: this.width,
        height: this.height,
        top: this.top,
        left: this.left,
        right: this.right,
        bottom: this.bottom,
      }
    }
  }

  // mock 所有 DOM 元素的 getBoundingClientRect 方法
  Element.prototype.getBoundingClientRect = function () {
    return new DOMRect(0, 0, 100, 100)
  }

  for (const propertyName of ['top', 'right', 'bottom', 'left']) {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(DOMRect.prototype, propertyName)
    propertyDescriptor.enumerable = true
    Object.defineProperty(DOMRect.prototype, propertyName, propertyDescriptor)
  }

  window.DOMRect = window.DOMRect || DOMRect
}

{
  window.DOMPoint = window.DOMPoint || DOMPoint
  window.DOMMatrix = window.DOMMatrix || DOMMatrix
}
