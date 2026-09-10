export async function getProducts() {
    const response = await fetch("/api/inventory/products");
  
    if (!response.ok) {
      throw new Error("Failed to load products.");
    }
  
    return response.json();
  }
  
  export async function createProduct(data: unknown) {
    const response = await fetch("/api/inventory/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  
    if (!response.ok) {
      throw new Error("Failed to create product.");
    }
  
    return response.json();
  }
  
  export async function updateProduct(
    id: string,
    data: unknown
  ) {
    const response = await fetch(
      `/api/inventory/products/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to update product.");
    }
  
    return response.json();
  }
  
  export async function archiveProduct(id: string) {
    const response = await fetch(
      `/api/inventory/products/${id}`,
      {
        method: "DELETE",
      }
    );
  
    if (!response.ok) {
      throw new Error("Failed to archive product.");
    }
  
    return response.json();
  }