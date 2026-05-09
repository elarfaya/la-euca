const BASE_URL = "https://sheetdb.io/api/v1/jicyvu20q0lfl"

export async function getExpenses() {
    const response = await fetch(
        `${BASE_URL}?sheet=expenses`
    )


    return await response.json()
}

export async function createExpense(expense) {

    await fetch(
        `${BASE_URL}?sheet=expenses`,
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
    `${BASE_URL}/id/${id}?sheet=expenses`,
    {
      method: "DELETE"
    }
  )
}

export async function getParticipants() {

  const response = await fetch(
    `${BASE_URL}?sheet=participants`
  )

  return await response.json()
}

export async function getConfig() {

  const response = await fetch(
    `${BASE_URL}?sheet=config`
  )

  return await response.json()
}