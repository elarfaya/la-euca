const READ_URL =
    "https://script.google.com/macros/s/AKfycbyvDkWjcwLs5kc8kRenIa5S_GMD_Gi1o5Qpj5puZ1eELtymRvPNar2Ph_3V-B-Mne-oPA/exec"

const PRIMARY_WRITE_URL =
    "https://sheetdb.io/api/v1/jicyvu20q0lfl"

const BACKUP_WRITE_URL =
    "https://sheetdb.io/api/v1/mliu5cqq5ca32"

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

    await fetchWithFallback(
        `${PRIMARY_WRITE_URL}?sheet=expenses`,
        {
            method: "POST",
            headers: {
                "Content-Type":
                    "application/json"
            },
            body: JSON.stringify({
                data: expense
            })
        }
    )
}

export async function removeExpense(id) {

    await fetchWithFallback(
        `${PRIMARY_WRITE_URL}/id/${id}?sheet=expenses`,
        {
            method: "DELETE"
        }
    )
}

async function fetchWithFallback(
    url,
    options
) {

    let response =
        await fetch(url, options)

    if (
        response.status === 429
    ) {

        response = await fetch(
            url.replace(
                PRIMARY_WRITE_URL,
                BACKUP_WRITE_URL
            ),
            options
        )
    }

    return response
}