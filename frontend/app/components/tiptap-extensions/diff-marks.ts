import { Mark } from '@tiptap/core'

export const InsertionMark = Mark.create({
  name: 'insertion',

  parseHTML() {
    return [{ tag: 'span[data-diff="insertion"]' }]
  },

  renderHTML() {
    return ['span', { 'data-diff': 'insertion', class: 'tiptap-insertion' }, 0]
  },
})

export const DeletionMark = Mark.create({
  name: 'deletion',

  parseHTML() {
    return [{ tag: 'span[data-diff="deletion"]' }]
  },

  renderHTML() {
    return ['span', { 'data-diff': 'deletion', class: 'tiptap-deletion' }, 0]
  },
})
