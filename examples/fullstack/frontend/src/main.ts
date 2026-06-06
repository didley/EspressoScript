import type { Item } from './api.ts'
import { addItem, fetchItems } from './api.ts'

function renderItems(items: readonly Item[]): void {
    const list = document.getElementById('items')
    if (list === null) return
    list.innerHTML = items
        .map(function toHtml(item: Item): string {
            return `<li data-id="${item.id}">${item.title}</li>`
        })
        .join('')
}

async function refresh(): Promise<void> {
    const [items, err] = await fetchItems()
    if (err !== null) {
        console.error(`fetch failed: ${err.message}`)
        return
    }
    if (items === null) return
    renderItems(items)
}

async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault()
    const form = e.currentTarget
    if (!(form instanceof HTMLFormElement)) return
    const data = new FormData(form)
    const title = data.get('title')
    if (typeof title !== 'string' || title.trim().length === 0) return
    const [, err] = await addItem(title)
    if (err !== null) {
        console.error(`add failed: ${err.message}`)
        return
    }
    form.reset()
    void refresh()
}

function main(): void {
    const form = document.getElementById('add-form')
    if (form instanceof HTMLFormElement) {
        form.addEventListener('submit', function onSubmit(e: Event): void {
            if (e instanceof SubmitEvent) {
                void handleSubmit(e)
            }
        })
    }
    void refresh()
}

main()
