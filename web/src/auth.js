// Internet Identity authentication for Ordovician Search.
// A Principal is obtained from an Identity, NOT directly from AuthClient.
import { AuthClient } from '@icp-sdk/auth/client'
import { getProfileName } from './profile.js'

const safeLabel = t => String(t).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
const short = t => t.length > 17 ? `${t.slice(0, 5)}…${t.slice(-5)}` : t
const root = () => document.getElementById('auth')
let client
let principal = ''
let busy = false
let lastError = ''

const notify = () => window.dispatchEvent(new Event('ordovician:auth-changed'))

function render() {
  const el = root()
  if (!el) return
  if (principal) {
    const name = getProfileName(principal)
    el.innerHTML = `<a class="btn" href="#/profile" title="My Profile">${name ? safeLabel(name) : 'My Profile'}</a><span class="pid" title="${safeLabel(principal)}">${short(principal)}</span><button class="btn" data-act="out">Log out</button>`
  } else {
    el.innerHTML = `<button class="btn" data-act="in" ${busy ? 'disabled' : ''}>${busy ? 'Connecting…' : lastError ? 'Retry login' : 'Login'}</button>${lastError ? `<span class="auth-error" role="alert" title="${safeLabel(lastError)}">${safeLabel(lastError)}</span>` : ''}`
  }
}

async function refreshIdentity() {
  const previous = principal
  try {
    if (!client.isAuthenticated()) {
      principal = ''
    } else {
      const identity = await client.getIdentity()
      principal = identity.getPrincipal().toText()
    }
  } catch (error) {
    console.error('Unable to restore Internet Identity session:', error)
    principal = ''
  }
  render()
  if (previous !== principal) notify()
}

export async function initAuth() {
  try {
    client = new AuthClient()
    client.subscribe(() => { void refreshIdentity() })
    await refreshIdentity()
  } catch (error) {
    console.error('Unable to initialize Internet Identity:', error)
    lastError = 'Authentication could not initialize. Check browser storage and reload.'
    render()
    return
  }
  window.addEventListener('ordovician:profile-updated', render)
  root()?.addEventListener('click', async event => {
    const action = event.target.closest('[data-act]')?.dataset.act
    if (!action || busy) return
    busy = true
    lastError = ''
    render()
    if (action === 'in') {
      try {
        // Must be initiated from the user's click; the SDK opens the II popup.
        const identity = await client.signIn({ maxTimeToLive: 8n * 3_600_000_000_000n })
        principal = identity.getPrincipal().toText()
        notify()
      } catch (error) {
        console.error('Internet Identity login failed:', error)
        lastError = String(error?.message || error || 'Unknown sign-in error').slice(0, 230)
      }
    } else if (action === 'out') {
      try {
        await client.signOut()
        principal = ''
        notify()
      } catch (error) {
        console.error('Internet Identity logout failed:', error)
        lastError = String(error?.message || error || 'Sign-out failed').slice(0, 230)
      }
    }
    busy = false
    render()
  })
}

export const currentPrincipal = () => principal
