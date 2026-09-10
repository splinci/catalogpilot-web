export async function getInventoryHistory() {
    const response = await fetch(
      "/api/inventory/transactions",
      {
        cache: "no-store",
      }
    );
  
    if (!response.ok) {
      throw new Error(
        "Failed to load inventory history."
      );
    }
  
    return response.json();
  }