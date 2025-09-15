'use client'

import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function Home() {
  const { data, error } = useSWR('http://localhost:3001/api/info', fetcher)
  
  if (error) return <div>Error Loading</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <main>
      <h1>Noxa (Dashboard)</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}