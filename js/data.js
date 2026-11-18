/* SwiftShift Movers - single shared price data.
   The quote form and every price table on the site read from this one
   object, so the form and the Pricing page can never disagree. */
window.SS_DATA = {
  homeTiers: [
    { id: "studio", label: "Studio or 1 bed home", crew: "Crew of 3", loads: "One truck load", price: 18000, group: "small" },
    { id: "bed2", label: "2 bed home", crew: "Crew of 4", loads: "One to two truck loads", price: 28000, group: "small" },
    { id: "bed3", label: "3 bed home", crew: "Crew of 4 to 5", loads: "Two truck loads", price: 38000, group: "large" },
    { id: "bed4", label: "4 bed and larger home", crew: "Crew of 6", loads: "Survey recommended", price: 52000, group: "large" }
  ],
  officeTiers: [
    { id: "office-small", label: "Small office move", detail: "Up to 10 workstations", price: 45000 },
    { id: "office-large", label: "Large office move", detail: "11 to 40 workstations, final price after a free survey", price: 85000 }
  ],
  perWorkstation: 4500,
  bands: [
    { id: "city", label: "Within the city", price: 0, note: "Included in the base price" },
    { id: "nearby", label: "Nearby city, up to about 100 km", price: 15000, note: "Added to the base price" },
    { id: "intercity", label: "Intercity, longer distance", price: 40000, note: "Starting band, final route price confirmed after booking" }
  ],
  addons: [
    { id: "packing", label: "Full packing service", prices: { small: 8000, large: 14000, office: 14000 },
      note: "Price depends on the size of the move. Offices are charged at the large home rate." },
    { id: "dismantling", label: "Furniture dismantling and reassembly", price: 3500, note: "Per booking" },
    { id: "appliances", label: "Appliance handling", price: 2500, note: "Fridge, washing machine and AC indoor units, per booking" },
    { id: "priority", label: "Priority weekend or evening slot", price: 3000, note: "Per booking" }
  ],
  storagePerWeek: 6000,
  deposit: 5000
};
