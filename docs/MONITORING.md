# Monitoring Strategy

## Health
- `/healthz` uptime check every minute.
- `/metrics` scraped by Prometheus-compatible monitoring.

## Alerts
- API 5xx rate above `2%` for 5 minutes.
- Webhook signature failures above `5` in 10 minutes.
- Webhook failed delivery rate above `0.5%`.
- Dead-letter jobs above `0`.
- Queue depth above `100`.
- Supplier failure rate above `5%`.
- Payment failure rate above `8%`.
- Delayed shipments above `3`.
- Refund rate above `8%`.
- Chargeback rate above `0.8%`.
- Net profit negative for 2 consecutive days.

## Logs
- Log event IDs, order IDs, job IDs, provider, topic, status, and error class.
- Never log full payment secrets, API keys, card data, or customer-sensitive message bodies.

## Dashboards
- Revenue, net profit, ad spend, CAC, ROAS, AOV.
- Refund rate, chargeback rate, delayed orders.
- Product score distribution and win/loss decisions.
- Webhook volume, duplicate events, and dead-letter count.
