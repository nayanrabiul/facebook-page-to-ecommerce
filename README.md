### This is a project where a **complete e-commerce website** will be created using a Facebook page.

In Bangladesh, many people run online businesses using Facebook pages — they upload their products through Facebook posts.
The goal of this project is to take all the products, posts, and information from such a page, organize them in a structured way, and transform them into a complete website — where everything will be categorized properly.

## User Workflow

1. First, a user will provide a **Facebook page link**.
2. Our system, through an **MCP server** (which we will develop), will collect the first **100 posts** from that page.
3. These posts will be analyzed to determine what type of product each one represents — such as clothing, electronics, cosmetics, etc.
4. Based on this data, the system will automatically **create categories**.
5. Inside each category, there will be relevant product information — such as name, price, image, and description.
6. Finally, using this organized data, a beautiful **e-commerce website** will be generated.

## System Structure

These functions will basically depend on the **MCP server**.
The MCP server will read data from Facebook, create categories, and generate products under those categories.

* **1️⃣ Facebook Reader Tool:** Reads the first 100 posts from the page.
* **2️⃣ Category Analyzer:** Determines which category each post belongs to based on its content.
* **3️⃣ Data Manager:** Stores all data and connects it to the frontend.
* **4️⃣ Product Generator:** Automatically creates products from the collected data.

