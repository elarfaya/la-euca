const READ_URL =
  "https://script.google.com/macros/s/AKfycbyvDkWjcwLs5kc8kRenIa5S_GMD_Gi1o5Qpj5puZ1eELtymRvPNar2Ph_3V-B-Mne-oPA/exec"

const WRITE_URL =
  "https://sheetdb.io/api/v1/d315esql3sk7q"

export async function getExpenses() {

  const response = await fetch(
    `${READ_URL}?sheet=expenses`
  )

  return await response.json()
}

export async function getParticipants() {

  const response = await fetch(
    `${READ_URL}?sheet=participants`
  )

  return await response.json()
}

export async function getConfig() {

  const response = await fetch(
    `${READ_URL}?sheet=config`
  )

  return await response.json()
}

export async function createExpense(expense) {

  await fetch(
    `${WRITE_URL}?sheet=expenses`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        data: expense
      })
    }
  )
}

export async function removeExpense(id) {

  await fetch(
    `${WRITE_URL}/id/${id}?sheet=expenses`,
    {
      method: "DELETE"
    }
  )
}