
export default {
  SET_PAGE: (state, { page }) => {
    state.page = page
  },
  SET_TOTAL: (state, { total }) => {
    state.total = total
  },
  SET_ITEMS: (state, { items }) => {
    state.items = items
  },
  SET_BLOG: (state, { blog }) => {
    state.blog = blog
  },
  SET_PREV: (state, { prev }) => {
    state.prev = prev
  },
  SET_NEXT: (state, { next }) => {
    state.next = next
  },
  SET_ARCHIVES: (state, { archives }) => {
    state.archives = archives
  },
  SET_TAGS: (state, { tags }) => {
    state.tags = tags
  }
}
