
interface TableProps {
    headers: string[];
    children: React.ReactNode;
}

export const Table = ({ headers, children} : TableProps) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-neutral-600 bg-warrior-grey">
      <table className="w-full text-left border-collapse">
        <thead>
            <tr className="border-b border-neutral-600 bg-neutral-800/50">
                {headers.map((header) => (
                    <th 
                        key={header}
                        className="p-4 text-xs font-bold uppercase tracking-wider text-gray-400"
                    >
                        {header}
                    </th>
                ))}
            </tr>
        </thead>

        <tbody className="divide-y divide-neutral-600">
            {children}
        </tbody>
      </table>
    </div>
  )
}


