import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 's-maxage=1, stale-while-revalidate');
  res.status(200).json(
    [
        {
            id: 1,
            title: 'The Awakening',
            author: 'Kate Chopin',
        },
        {
            id: 2,
            title: 'City of Glass',
            author: 'Paul Auster',
        },
    ]
  )
}