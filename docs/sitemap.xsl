<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:html="http://www.w3.org/TR/REC-html40"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title>XML Sitemap | Infinity Bangladesh (ইনফিনিটি বাংলাদেশ)</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="robots" content="noindex, follow" />
        <style type="text/css">
          :root {
            --primary: #006A4E;
            --primary-dark: #00523C;
            --primary-light: #E6F4EF;
            --slate-900: #0F172A;
            --slate-700: #334155;
            --slate-500: #64748B;
            --slate-200: #E2E8F0;
            --slate-50: #F8FAFC;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background: #FAF7F2;
            color: var(--slate-900);
            line-height: 1.5;
            padding: 32px 16px;
          }
          .container {
            max-width: 1100px;
            margin: 0 auto;
            background: #FFFFFF;
            border-radius: 20px;
            border: 1px border var(--slate-200);
            box-shadow: 0 10px 30px -10px rgba(0, 106, 78, 0.08);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #006A4E 0%, #0A4E3B 100%);
            color: #FFFFFF;
            padding: 36px 32px;
          }
          .brand-row {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 12px;
          }
          .brand-badge {
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.25);
            color: #FFFFFF;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          h1 {
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.02em;
            margin-bottom: 6px;
          }
          .subtitle {
            color: rgba(255, 255, 255, 0.85);
            font-size: 14px;
            max-width: 720px;
          }
          .stats-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
          }
          .stat-chip {
            background: rgba(255, 255, 255, 0.12);
            padding: 6px 14px;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 600;
          }
          .stat-count {
            color: #6EE7B7;
            font-weight: 800;
          }
          .table-wrapper {
            overflow-x: auto;
            padding: 24px 32px 36px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          th {
            background: var(--slate-50);
            color: var(--slate-700);
            text-align: left;
            padding: 12px 14px;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            border-bottom: 2px solid var(--slate-200);
          }
          td {
            padding: 12px 14px;
            border-bottom: 1px solid var(--slate-200);
            color: var(--slate-700);
            word-break: break-all;
          }
          tr:hover td {
            background: var(--primary-light);
          }
          a {
            color: var(--primary);
            text-decoration: none;
            font-weight: 600;
          }
          a:hover {
            text-decoration: underline;
            color: var(--primary-dark);
          }
          .priority-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 11px;
            background: #ECFDF5;
            color: #047857;
            border: 1px solid #A7F3D0;
          }
          .freq-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            background: var(--slate-50);
            color: var(--slate-700);
            border: 1px solid var(--slate-200);
            text-transform: capitalize;
          }
          .footer {
            background: var(--slate-50);
            padding: 18px 32px;
            border-top: 1px solid var(--slate-200);
            font-size: 12px;
            color: var(--slate-500);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
          }
          .footer a {
            color: var(--primary);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand-row">
              <span class="brand-badge">Official Search Engine Index</span>
              <span class="brand-badge">100% Charity Model</span>
            </div>
            <h1>Infinity Bangladesh — XML Sitemap</h1>
            <p class="subtitle">
              This is the official search engine XML sitemap of <strong>Infinity Bangladesh (ইনফিনিটি বাংলাদেশ)</strong>, designed for Googlebot, Bingbot, and modern search crawlers. It indexes all primary humanitarian hubs, life-saving blood donation directories, and radical transparency reports.
            </p>
            <div class="stats-bar">
              <div class="stat-chip">
                Total Indexed URLs: <span class="stat-count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></span>
              </div>
              <div class="stat-chip">
                Protocol: <span class="stat-count">sitemaps.org 0.9</span>
              </div>
              <div class="stat-chip">
                Primary Host: <span class="stat-count">infinitybangladesh.vercel.app</span>
              </div>
            </div>
          </div>

          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width: 50%;">URL Location</th>
                  <th style="width: 14%;">Priority</th>
                  <th style="width: 16%;">Change Frequency</th>
                  <th style="width: 20%;">Last Modified</th>
                </tr>
              </thead>
              <tbody>
                <xsl:for-each select="sitemap:urlset/sitemap:url">
                  <tr>
                    <td>
                      <a href="{sitemap:loc}" target="_blank" rel="noopener noreferrer">
                        <xsl:value-of select="sitemap:loc"/>
                      </a>
                    </td>
                    <td>
                      <span class="priority-badge">
                        <xsl:value-of select="sitemap:priority"/>
                      </span>
                    </td>
                    <td>
                      <span class="freq-badge">
                        <xsl:value-of select="sitemap:changefreq"/>
                      </span>
                    </td>
                    <td>
                      <xsl:value-of select="sitemap:lastmod"/>
                    </td>
                  </tr>
                </xsl:for-each>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <span>© 2015–2026 Infinity Bangladesh. All rights reserved.</span>
            <span>
              <a href="https://infinitybangladesh.vercel.app/" target="_blank" rel="noopener noreferrer">Visit Infinity Bangladesh Portal →</a>
            </span>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>

