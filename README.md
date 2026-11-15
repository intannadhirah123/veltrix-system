# VELTRIX — Car Rental Management System

Static web app (HTML, CSS, JavaScript). All data is saved in the browser with `localStorage`.

## How to run
1. Open the folder in Visual Studio Code.
2. Install the **Live Server** extension, right-click `index.html` → **Open with Live Server**.
   (You can also double-click `index.html`, but Live Server is recommended.)

An internet connection is needed for Chart.js, Bootstrap Icons and the Google font (loaded from CDN).

## Pages
| File | Purpose |
|---|---|
| `index.html` | Dashboard: header image with Welcome greeting and animated SVG cars, KPIs, 3 charts, Regulatory Reminder, upcoming pickups/returns, recent bookings |
| `vehicles.html` | Fleet Management: cards/table views, filters, add/edit/delete with validation, CSV export |
| `customers.html` | 12 customers, latest booking, type (New/Regular/VIP), totals, status, booking history |
| `bookings.html` | Create/edit/cancel, auto price, double-booking check, calendar, status filter, upcoming pickups/returns, printable confirmation |
| `inspections.html` | Overview, records (Check-in/Check-out filter), new inspection form, interactive checklist, photo upload, history, auto vehicle status |
| `insights.html` | Date range + brand filter, 7 interactive charts with drill-down, auto highlights, CSV export, print |
| `guides.html` | 4 articles on Malaysian rental regulations and safety |

## Notes
- Notifications: a new booking is saved in `localStorage` and shows a red count on the bell. Click a notification to open the booking; mark one or all as read.
- Dark mode: moon/sun icon in the top bar (remembered per browser).
- Sample data is created on first visit. Profile menu → **Reset sample data** restores it.
- To publish on GitHub Pages, upload the folder contents to a repository and enable Pages; all paths are relative.
- Car pictures are SVG drawings (js/cars.js) in 4 body styles — hatchback, sedan, MPV, SUV — coloured to match each vehicle. Static copies are in assets/img/cars/.

## Real car photos
- **Per vehicle:** Fleet > Edit > *Vehicle photo* (any upload is saved as SVG), or Details > *Add real photo*.
- **Per model:** save SVG files in `assets/img/cars/photos/` named `myvi.svg`, `saga.svg`, etc. Every car of that model uses it.
- **photo-to-svg.html** turns a JPG/PNG into an `.svg` file (the photo is embedded inside the SVG) and can attach it straight to a vehicle.
- If no photo is found, the drawn SVG car is shown.

### Photos included
`assets/img/cars/photos/` holds real photos converted to SVG (photo embedded inside each SVG):
axia, viva, bezza, saga, persona, alza, exora, ativa, aruz, x50, x70, myvi, iriz (all 13 models).
Several photos carry a paultan.org watermark — credit the source in your report or replace them with your own photos.

All image files in this project are SVG — there are no .jpg or .png files.


Veltrix is an educational IMS566 Individual Assignment prototype, not an official car rental website. The administrator identity is created automatically for demonstration. No sign-in or registration is required. This front-end auto-entry behavior is not secure authentication and must not be used to protect real or confidential data. Customer records and rental records are presented for monitoring and review.


## Admin access (IMS566 demonstration)

Veltrix uses a single preconfigured administrator sign-in for the IMS566 academic prototype. The login page opens with the username and password fields prefilled; click Login to verify the credentials and enter the Admin Dashboard. No registration page is included. Demo username: Intannadhirah. Demo password: veltrix123. Authentication is client-side JavaScript with sessionStorage only; it is not secure authentication and must not be used for real customer or business data.
