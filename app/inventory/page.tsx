import { prisma } from "@/lib/prisma";
import SideBar from "../components/sidebar";
import { getCurrentUser } from "@/lib/auth";
import { deleteProduct } from "@/lib/actions/products";
import Pagination from "../components/pagination";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const user = await getCurrentUser();
  const userId = user?.id;

  const params = await searchParams;
  const query = (params.query || "").trim();

  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const pageSize = 5;
  const skip = (page - 1) * pageSize;

  const where = {
    userId,
    ...(query
      ? { name: { contains: query, mode: "insensitive" as const } }
      : {}),
  };

  const [totalCount, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      ...(Number.isFinite(skip) && skip > 0 ? { skip } : {}),
      take: pageSize,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // TODO kinda ugly that the search form does a full page reload
  return (
    <div className="min-h-screen bg-gray-50">
      <SideBar currentPath="/inventory" />
      <main className="px-4 pb-4 pt-20 lg:p-8 lg:ml-64">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Inventory
              </h1>
              <p className="text-sm text-gray-600">
                Manage your products and track inventory levels.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          {/* Search  */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <form action="/inventory" method="GET" className="flex gap-2">
              <input
                name="query"
                placeholder="Search products..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
              />
              <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Search
              </button>
            </form>
          </div>
          {/* Products Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Low Stock At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg=white divide-y divide-gray-200">
                {items.map((item, key) => (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.sku || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {Number(item.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.lowStockAt || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <form
                        action={async (formData: FormData) => {
                          "use server";
                          await deleteProduct(formData);
                        }}
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <button className="text-red-600 hover:text-red-900">
                          Delete
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                baseUrl="/inventory"
                searchParams={{ query, pageSize: String(pageSize) }}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
