# CSV Dataset Inspection Report

- **Generated:** 2026-11-17 15:14:49 UTC
- **Pandas:** 3.1.1
- **Input files:** `backend/data/raw/` originals; read-only inspection.
- **Parsing note:** embedded metadata/header rows are excluded from data-row counts.
- **Synthetic label note:** the unnamed index-like field in the second and third CSVs is labeled `Source_Row_Index` for inspection; its source meaning and key suitability are unverified.

## Summary

| Dataset | Data rows | Columns | Skipped header rows | Exact duplicates | Possible payload duplicates |
| --- | --- | --- | --- | --- | --- |
| combined_cars.csv | 14,828 | 10 | 0 | 14,488 | 14,488 |
| combined_cars2.csv | 5,183 | 24 | 1 | 0 | 1,052 |
| combined_cars3.csv | 15,411 | 15 | 1 | 0 | 167 |

Duplicate counts compare parsed field values; they are not confirmed duplicate vehicles. Sparse or misaligned source schemas can produce repeated blank-heavy rows.

## Dataset details

## combined_cars.csv

- **Data rows:** 14,828
- **Data columns:** 10
- **CSV header/metadata rows skipped:** 0
- **Pandas version:** 3.1.1
- **Exact full-row duplicates after parsing:** 14,488
- **Potential same-payload duplicates** (excluding source row index and `Id`, but retaining other fields): 14,488

### Exact column names and Pandas dtypes

| Column | Pandas dtype | Non-missing | Missing |
| --- | --- | --- | --- |
| Source.Name | str | 14828 | 0 |
| Car_Name | str | 301 | 14527 |
| Year | float64 | 2360 | 12468 |
| Selling_Price | float64 | 301 | 14527 |
| Present_Price | float64 | 301 | 14527 |
| Kms_Driven | float64 | 301 | 14527 |
| Fuel_Type | str | 301 | 14527 |
| Seller_Type | str | 301 | 14527 |
| Transmission | str | 2360 | 12468 |
| Owner | float64 | 301 | 14527 |

### First 10 data records

| Source.Name | Car_Name | Year | Selling_Price | Present_Price | Kms_Driven | Fuel_Type | Seller_Type | Transmission | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| car data.csv | ritz | 2014.0 | 3.35 | 5.59 | 27000.0 | Petrol | Dealer | Manual | 0.0 |
| car data.csv | sx4 | 2013.0 | 4.75 | 9.54 | 43000.0 | Diesel | Dealer | Manual | 0.0 |
| car data.csv | ciaz | 2017.0 | 7.25 | 9.85 | 6900.0 | Petrol | Dealer | Manual | 0.0 |
| car data.csv | wagon r | 2011.0 | 2.85 | 4.15 | 5200.0 | Petrol | Dealer | Manual | 0.0 |
| car data.csv | swift | 2014.0 | 4.6 | 6.87 | 42450.0 | Diesel | Dealer | Manual | 0.0 |
| car data.csv | vitara brezza | 2018.0 | 9.25 | 9.83 | 2071.0 | Diesel | Dealer | Manual | 0.0 |
| car data.csv | ciaz | 2015.0 | 6.75 | 8.12 | 18796.0 | Petrol | Dealer | Manual | 0.0 |
| car data.csv | s cross | 2015.0 | 6.5 | 8.61 | 33429.0 | Diesel | Dealer | Manual | 0.0 |
| car data.csv | ciaz | 2016.0 | 8.75 | 8.89 | 20273.0 | Diesel | Dealer | Manual | 0.0 |
| car data.csv | ciaz | 2015.0 | 7.45 | 8.92 | 42367.0 | Diesel | Dealer | Manual | 0.0 |

### Numerical summaries

| Column | Parsed numeric | Unparsed | Infinite | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Year | 2,360 | 0 | 0 | 1988.0 | 2022.0 | 2016.0686440677966 |
| Selling_Price | 301 | 0 | 0 | 0.1 | 35.0 | 4.661295681063123 |
| Present_Price | 301 | 0 | 0 | 0.32 | 92.6 | 7.628471760797343 |
| Kms_Driven | 301 | 0 | 0 | 500.0 | 500000.0 | 36947.20598006644 |
| Owner | 301 | 0 | 0 | 0.0 | 3.0 | 0.04318936877076412 |

Numeric parsing is also attempted for string-typed columns. Averages exclude missing, unparseable, and infinite values. Fields selected by numeric-like names can be mixed; inspect their parse-failure counts.

### Categorical unique values

<details><summary><code>Source.Name</code>: 4 unique non-missing value(s)</summary>

- `car data.csv`
- `CAR DETAILS FROM CAR DEKHO.csv`
- `Car details v3.csv`
- `car details v4.csv`

</details>

<details><summary><code>Car_Name</code>: 98 unique non-missing value(s)</summary>

- `800`
- `Activa 3g`
- `Activa 4g`
- `alto 800`
- `alto k10`
- `amaze`
- `Bajaj  ct 100`
- `Bajaj Avenger 150`
- `Bajaj Avenger 150 street`
- `Bajaj Avenger 220`
- `Bajaj Avenger 220 dtsi`
- `Bajaj Avenger Street 220`
- `Bajaj Discover 100`
- `Bajaj Discover 125`
- `Bajaj Dominar 400`
- `Bajaj Pulsar  NS 200`
- `Bajaj Pulsar 135 LS`
- `Bajaj Pulsar 150`
- `Bajaj Pulsar 220 F`
- `Bajaj Pulsar NS 200`
- `Bajaj Pulsar RS200`
- `baleno`
- `brio`
- `camry`
- `ciaz`
- `city`
- `corolla`
- `corolla altis`
- `creta`
- `dzire`
- `elantra`
- `eon`
- `ertiga`
- `etios cross`
- `etios g`
- `etios gd`
- `etios liva`
- `fortuner`
- `grand i10`
- `Hero  CBZ Xtreme`
- `Hero  Ignitor Disc`
- `Hero Extreme`
- `Hero Glamour`
- `Hero Honda CBZ extreme`
- `Hero Honda Passion Pro`
- `Hero Hunk`
- `Hero Passion Pro`
- `Hero Passion X pro`
- `Hero Splender iSmart`
- `Hero Splender Plus`
- `Hero Super Splendor`
- `Honda Activa 125`
- `Honda Activa 4G`
- `Honda CB Hornet 160R`
- `Honda CB Shine`
- `Honda CB Trigger`
- `Honda CB twister`
- `Honda CB Unicorn`
- `Honda CBR 150`
- `Honda Dream Yuga `
- `Honda Karizma`
- `Hyosung GT250R`
- `i10`
- `i20`
- `ignis`
- `innova`
- `jazz`
- `KTM 390 Duke `
- `KTM RC200`
- `KTM RC390`
- `land cruiser`
- `Mahindra Mojo XT300`
- `omni`
- `ritz`
- `Royal Enfield Bullet 350`
- `Royal Enfield Classic 350`
- `Royal Enfield Classic 500`
- `Royal Enfield Thunder 350`
- `Royal Enfield Thunder 500`
- `s cross`
- `Suzuki Access 125`
- `swift`
- `sx4`
- `TVS Apache RTR 160`
- `TVS Apache RTR 180`
- `TVS Jupyter`
- `TVS Sport `
- `TVS Wego`
- `UM Renegade Mojave`
- `verna`
- `vitara brezza`
- `wagon r`
- `xcent`
- `Yamaha Fazer `
- `Yamaha FZ  v 2.0`
- `Yamaha FZ 16`
- `Yamaha FZ S `
- `Yamaha FZ S V 2.0`

</details>

<details><summary><code>Fuel_Type</code>: 3 unique non-missing value(s)</summary>

- `CNG`
- `Diesel`
- `Petrol`

</details>

<details><summary><code>Seller_Type</code>: 2 unique non-missing value(s)</summary>

- `Dealer`
- `Individual`

</details>

<details><summary><code>Transmission</code>: 2 unique non-missing value(s)</summary>

- `Automatic`
- `Manual`

</details>

### Possible invalid or inconsistent values

- `Car_Name` has 5 value(s) with leading or trailing whitespace.
- Source.Name groups have 3 different populated-column patterns. A single shared row schema may be misaligned (examples: `CAR DETAILS FROM CAR DEKHO.csv`: no other populated fields; `car data.csv`: `Car_Name`, `Year`, `Selling_Price`, `Present_Price`, `Kms_Driven`, `Fuel_Type`, `Seller_Type`, `Transmission`, `Owner`; `car details v4.csv`: `Year`, `Transmission`).

### Source file groups and populated-column coverage

The `Source.Name` values identify source-file groups within this combined CSV. Different populated-column patterns are evidence that one global header may not describe every source group.

| Source.Name | Rows | Populated fields (non-missing counts) |
| --- | --- | --- |
| CAR DETAILS FROM CAR DEKHO.csv | 4,340 | No populated non-source fields |
| Car details v3.csv | 8,128 | No populated non-source fields |
| car data.csv | 301 | `Car_Name` (301), `Year` (301), `Selling_Price` (301), `Present_Price` (301), `Kms_Driven` (301), `Fuel_Type` (301), `Seller_Type` (301), `Transmission` (301), `Owner` (301) |
| car details v4.csv | 2,059 | `Year` (2,059), `Transmission` (2,059) |


### Price-field values by Source.Name

These are values parsed from each flattened column under the CSV's top-level header. For groups with different populated-field patterns, they may not represent the named price measure.

| Source.Name | Price field | Finite numeric values | Unparsed non-missing | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| CAR DETAILS FROM CAR DEKHO.csv | Selling_Price | 0 | 0 | — | — | — |
| CAR DETAILS FROM CAR DEKHO.csv | Present_Price | 0 | 0 | — | — | — |
| Car details v3.csv | Selling_Price | 0 | 0 | — | — | — |
| Car details v3.csv | Present_Price | 0 | 0 | — | — | — |
| car data.csv | Selling_Price | 301 | 0 | 0.1 | 35.0 | 4.661295681063123 |
| car data.csv | Present_Price | 301 | 0 | 0.32 | 92.6 | 7.628471760797343 |
| car details v4.csv | Selling_Price | 0 | 0 | — | — | — |
| car details v4.csv | Present_Price | 0 | 0 | — | — | — |

Duplicate counts above compare parsed field values; they are not confirmed duplicate vehicles. Sparse or misaligned source schemas can create repeated blank-heavy rows.

## combined_cars2.csv

- **Data rows:** 5,183
- **Data columns:** 24
- **CSV header/metadata rows skipped:** 1
- **Pandas version:** 3.1.1
- **Exact full-row duplicates after parsing:** 0
- **Potential same-payload duplicates** (excluding source row index and `Id`, but retaining other fields): 1,052

### Exact column names and Pandas dtypes

| Column | Pandas dtype | Non-missing | Missing |
| --- | --- | --- | --- |
| Source.Name | str | 5183 | 0 |
| Source_Row_Index | float64 | 5175 | 8 |
| Id | str | 5183 | 0 |
| year | str | 5183 | 0 |
| brand | str | 5183 | 0 |
| full_model_name | str | 5183 | 0 |
| model_name | str | 5183 | 0 |
| price | str | 5183 | 0 |
| distance_travelled(kms) | str | 5183 | 0 |
| fuel_type | str | 5183 | 0 |
| city | str | 1725 | 3458 |
| brand_rank | float64 | 1725 | 3458 |
| car_age | float64 | 1725 | 3458 |
| distance below 30k km | float64 | 1725 | 3458 |
| new and less used | float64 | 1725 | 3458 |
| inv_car_price | float64 | 1725 | 3458 |
| inv_car_dist | float64 | 1725 | 3458 |
| inv_car_age | float64 | 1725 | 3458 |
| inv_brand | float64 | 1725 | 3458 |
| std_invprice | float64 | 1725 | 3458 |
| std_invdistance_travelled | float64 | 1725 | 3458 |
| std_invrank | float64 | 1725 | 3458 |
| best_buy1 | float64 | 1725 | 3458 |
| best_buy2 | float64 | 1725 | 3458 |

### First 10 data records

| Source.Name | Source_Row_Index | Id | year | brand | full_model_name | model_name | price | distance_travelled(kms) | fuel_type | city | brand_rank | car_age | distance below 30k km | new and less used | inv_car_price | inv_car_dist | inv_car_age | inv_brand | std_invprice | std_invdistance_travelled | std_invrank | best_buy1 | best_buy2 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Dataset.csv | 0.0 | 0 | 2016 | Honda | Honda Brio S MT | Brio | 425000 | 9680 | Petrol | Mumbai | 7.0 | 5.0 | 1.0 | 0.0 | 2.35e-06 | 0.000103306 | 0.2 | 0.142857143 | 0.143416889 | 0.035729816 | 0.132142857 | 677.1342393 | 0.0 |
| Dataset.csv | 1.0 | 1 | 2012 | Nissan | Nissan Sunny XV Diesel | Sunny | 325000 | 119120 | Diesel | Mumbai | 11.0 | 9.0 | 0.0 | 0.0 | 3.08e-06 | 8.39e-06 | 0.111111111 | 0.090909091 | 0.188858963 | 0.002496282 | 0.079545455 | 37.50131826 | 0.0 |
| Dataset.csv | 2.0 | 2 | 2017 | Toyota | Toyota Fortuner 2.8 4x2 MT [2016-2020] | Fortuner | 2650000 | 64593 | Diesel | Thane | 1.0 | 4.0 | 0.0 | 0.0 | 3.77e-07 | 1.55e-05 | 0.25 | 1.0 | 0.019415755 | 0.004977711 | 1.0 | 96.64601985 | 0.0 |
| Dataset.csv | 3.0 | 3 | 2017 | Mercedes-Benz | Mercedes-Benz E-Class E 220d Expression [2019-2019] | E-Class | 4195000 | 25000 | Diesel | Mumbai | 2.0 | 4.0 | 1.0 | 1.0 | 2.38e-07 | 4e-05 | 0.25 | 0.5 | 0.010692449 | 0.013562971 | 0.49375 | 71.60430612 | 71.60430612 |
| Dataset.csv | 4.0 | 4 | 2012 | Hyundai | Hyundai Verna Fluidic 1.6 CRDi SX | Verna | 475000 | 23800 | Diesel | Mumbai | 14.0 | 9.0 | 1.0 | 0.0 | 2.11e-06 | 4.2e-05 | 0.111111111 | 0.071428571 | 0.127870916 | 0.014269166 | 0.059821429 | 109.150857 | 0.0 |
| Dataset.csv | 5.0 | 5 | 2012 | Hyundai | Hyundai i20 Sportz 1.2 BS-IV | i20 | 335000 | 45000 | Petrol | Mumbai | 14.0 | 9.0 | 0.0 | 0.0 | 2.99e-06 | 2.22e-05 | 0.111111111 | 0.071428571 | 0.183093924 | 0.007337991 | 0.059821429 | 80.37257381 | 0.0 |
| Dataset.csv | 6.0 | 6 | 2019 | Toyota | Toyota Glanza V | Glanza | 750000 | 19500 | Petrol | Mumbai | 1.0 | 2.0 | 1.0 | 1.0 | 1.33e-06 | 5.13e-05 | 0.5 | 1.0 | 0.0794193 | 0.017513439 | 1.0 | 1390.905069 | 1390.905069 |
| Dataset.csv | 7.0 | 7 | 2018 | Mercedes-Benz | Mercedes-Benz GLE 250 d | GLE | 5500000 | 32000 | Diesel | Mumbai | 2.0 | 3.0 | 0.0 | 0.0 | 1.82e-07 | 3.13e-05 | 0.333333333 | 0.5 | 0.007142303 | 0.010499114 | 0.49375 | 37.02524898 | 0.0 |
| Dataset.csv | 8.0 | 8 | 2017 | Hyundai | Hyundai Grand i10 Sportz (O) AT 1.2 Kappa VTVT [2017-2018] | Grand | 565000 | 44329 | Petrol | Mumbai | 14.0 | 4.0 | 0.0 | 0.0 | 1.77e-06 | 2.26e-05 | 0.25 | 0.071428571 | 0.106821943 | 0.007455774 | 0.059821429 | 47.64419328 | 0.0 |
| Dataset.csv | 9.0 | 9 | 2015 | Maruti Suzuki | Maruti Suzuki Swift Dzire ZXI | Swift | 510000 | 48286 | Petrol | Mumbai | 32.0 | 6.0 | 0.0 | 0.0 | 1.96e-06 | 2.07e-05 | 0.166666667 | 0.03125 | 0.118802431 | 0.006808456 | 0.019140625 | 15.48210806 | 0.0 |

### Numerical summaries

| Column | Parsed numeric | Unparsed | Infinite | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Source_Row_Index | 5,175 | 0 | 0 | 0.0 | 1724.0 | 615.5717874396136 |
| Id | 5,175 | 8 | 0 | 0.0 | 2021.0 | 1630.927149758454 |
| year | 1,725 | 3,458 | 0 | 1990.0 | 2021.0 | 2015.3907246376812 |
| price | 5,175 | 8 | 0 | 350.0 | 14700000.0 | 534177.9679227053 |
| distance_travelled(kms) | 1,725 | 3,458 | 0 | 350.0 | 790000.0 | 53848.25623188406 |
| brand_rank | 1,725 | 0 | 0 | 1.0 | 81.0 | 15.731014492753623 |
| car_age | 1,725 | 0 | 0 | 0.0 | 31.0 | 5.609275362318841 |
| distance below 30k km | 1,725 | 0 | 0 | 0.0 | 1.0 | 0.26956521739130435 |
| new and less used | 1,725 | 0 | 0 | 0.0 | 1.0 | 0.20927536231884059 |
| inv_car_price | 1,725 | 0 | 0 | 6.8e-08 | 1.6e-05 | 1.416236579710145e-06 |
| inv_car_dist | 1,725 | 0 | 0 | 1.27e-06 | 0.002857143 | 4.0701193043478266e-05 |
| inv_car_age | 1,725 | 0 | 21 | 0.032258065 | 1.0 | 0.25883157537969487 |
| inv_brand | 1,725 | 0 | 0 | 0.012345679 | 1.0 | 0.1878100939530435 |
| std_invprice | 1,725 | 0 | 0 | 0.0 | 1.0 | 0.08462291919014492 |
| std_invdistance_travelled | 1,725 | 0 | 0 | 0.0 | 1.0 | 0.013808612316521739 |
| std_invrank | 1,725 | 0 | 0 | 0.0 | 1.0 | 0.17765772023478263 |
| best_buy1 | 1,725 | 0 | 0 | 0.0 | 2477.51764 | 88.96290176877855 |
| best_buy2 | 1,725 | 0 | 0 | 0.0 | 2477.51764 | 32.53720805757391 |

Numeric parsing is also attempted for string-typed columns. Averages exclude missing, unparseable, and infinite values. Fields selected by numeric-like names can be mixed; inspect their parse-failure counts.

### Categorical unique values

<details><summary><code>Source.Name</code>: 9 unique non-missing value(s)</summary>

- `Dataset.csv`
- `UsedCars_Banglore.csv`
- `UsedCars_Chennai.csv`
- `UsedCars_Combined.csv`
- `UsedCars_Delhi.csv`
- `UsedCars_Hyderabad.csv`
- `UsedCars_Kolkata.csv`
- `UsedCars_Mumbai.csv`
- `UsedCars_Pune.csv`

</details>

<details><summary><code>brand</code>: 782 unique non-missing value(s)</summary>

- `Audi`
- `Audi A3 35 TDI Premium`
- `Audi A3 35 TDI Premium + Sunroof`
- `Audi A3 35 TFSI Technology`
- `Audi A4 1.8 TFSI Multitronic Premium Plus`
- `Audi A4 2.0 TDI (143bhp)`
- `Audi A4 2.0 TDI (177bhp) Premium`
- `Audi A4 2.0 TDI (177bhp) Premium Plus`
- `Audi A4 2.0 TDI (177bhp) Premium Sport`
- `Audi A4 2.0 TFSI`
- `Audi A4 35 TDI Premium Plus`
- `Audi A6 2.0 TDI Premium`
- `Audi A6 2.0 TDI Premium Plus`
- `Audi A6 3.0 TDI quattro Premium Plus`
- `Audi A6 35 TDI Matrix`
- `Audi A6 35 TDI Premium`
- `Audi A8 L 3.0 TDI quattro`
- `Audi Q3 2.0 TDI quattro Premium`
- `Audi Q3 2.0 TDI quattro Premium Plus`
- `Audi Q3 30 TDI Premium FWD`
- `Audi Q3 30 TDI S`
- `Audi Q3 35 TDI Premium + Sunroof`
- `Audi Q3 35 TDI Premium Plus`
- `Audi Q3 35 TDI quattro Premium Plus`
- `Audi Q5 2.0 TDI quattro Premium`
- `Audi Q5 2.0 TDI quattro Premium Plus`
- `Audi Q5 2.0 TFSI quattro Premium Plus`
- `Audi Q5 3.0 TDI quattro Premium Plus`
- `Audi Q7 3.0 TDI quattro`
- `Audi Q7 3.0 TDI quattro Premium`
- `Audi Q7 3.0 TDI quattro Premium Plus`
- `Audi Q7 35 TDI Technology Pack`
- `Audi Q7 45 TDI Technology Pack`
- `Bentley`
- `Bentley Continental Flying Spur W12`
- `BMW`
- `BMW 3 Series 320d`
- `BMW 3 Series 320d Edition Sport`
- `BMW 3 Series 320d Highline Sedan`
- `BMW 3 Series 320d Luxury Line`
- `BMW 3 Series 320d Prestige`
- `BMW 3 Series 320d Sedan`
- `BMW 3 Series 320d Sport Line`
- `BMW 3 Series 325i Sedan`
- `BMW 3 Series GT 320d Luxury Line [2014-2016]`
- `BMW 3 Series GT 330i M Sport [2017-2019]`
- `BMW 5 Series 520d Luxury Line`
- `BMW 5 Series 520d Luxury Line [2017-2019]`
- `BMW 5 Series 520d M Sport`
- `BMW 5 Series 520d Sedan`
- `BMW 5 Series 523i Sedan`
- `BMW 5 Series 530d M Sport [2013-2017]`
- `BMW 6 Series 645i`
- `BMW 6 Series GT 630d M Sport [2018-2019]`
- `BMW 6 Series GT 630i Luxury Line [2018-2019]`
- `BMW 7 Series 730Ld`
- `BMW 7 Series 730Ld DPE`
- `BMW 7 Series 730Ld DPE (CBU)`
- `BMW 7 Series 730Ld DPE Signature`
- `BMW 7 Series 730Ld Eminence`
- `BMW 7 Series 730Ld Prestige`
- `BMW 7 Series 730Ld Sedan`
- `BMW 7 Series 740Li DPE Signature`
- `BMW 7 Series 740Li Sedan`
- `BMW 7 Series 750Li Sedan`
- `BMW X1 sDrive20d`
- `BMW X1 sDrive20d Expedition`
- `BMW X1 sDrive20d Sport Line`
- `BMW X1 sDrive20d xLine`
- `BMW X1 sDrive20i SportX`
- `BMW X1 xDrive20d M Sport`
- `BMW X3 2.5si`
- `BMW X3 xDrive 20d Expedition`
- `BMW X3 xDrive-20d xLine`
- `BMW X3 xDrive20d`
- `BMW X4 M [2019]`
- `BMW X5 SAV 4.4i`
- `BMW X5 xDrive 30d`
- `BMW X5 xDrive30d Pure Experience (5 Seater)`
- `BMW X5 xDrive30d xLine`
- `BMW X5 xDrive35i Pure Experience (5 seater)`
- `BMW X7 xDrive30d DPE Signature [2019-2020]`
- `BMW Z4 Roadster sDrive35i`
- `BMW Z4 sDrive 35i`
- `Chevrolet`
- `Chevrolet Beat LS Diesel`
- `Chevrolet Beat LS Petrol`
- `Chevrolet Beat LT Petrol`
- `Chevrolet Cruze LTZ AT`
- `Chevrolet Enjoy 1.3 LS 7 STR`
- `Datsun`
- `Datsun GO T`
- `Datsun redi-GO T(O) 1.0`
- `Fiat`
- `Fiat Abarth 595 Competizione`
- `Fiat Avventura Emotion Multijet 1.3`
- `Ford`
- `Ford Aspire Titanium1.5 TDCi`
- `Ford EcoSport Ambiente 1.5 TDCi`
- `Ford EcoSport Ambiente 1.5L Ti-VCT`
- `Ford EcoSport Titanium + 1.5L TDCi`
- `Ford EcoSport Titanium + 1.5L Ti-VCT`
- `Ford EcoSport Titanium 1.0 Ecoboost`
- `Ford EcoSport Titanium 1.5 TDCi`
- `Ford EcoSport Titanium 1.5 Ti-VCT`
- `Ford EcoSport Titanium 1.5 Ti-VCT AT`
- `Ford EcoSport Titanium 1.5L TDCi`
- `Ford EcoSport Titanium 1.5L Ti-VCT AT`
- `Ford EcoSport Titanium+ 1.5L TDCi Black Edition`
- `Ford EcoSport Trend + 1.5L TDCi`
- `Ford EcoSport Trend 1.5L TDCi`
- `Ford Endeavour 2.5L 4x2`
- `Ford Endeavour 3.0L 4x4 AT`
- `Ford Endeavour Titanium 2.2 4x2 AT`
- `Ford Endeavour Titanium 2.2 4x2 AT [2016-2018]`
- `Ford Endeavour Titanium 3.2 4x4 AT`
- `Ford Endeavour Titanium Plus 2.0 4x4 AT`
- `Ford Endeavour Trend 3.2 4x4 AT`
- `Ford Fiesta ZXi 1.6`
- `Ford Figo Duratec Petrol Titanium 1.2`
- `Ford Figo Duratorq Diesel Titanium 1.4`
- `Ford Figo Duratorq Diesel ZXI 1.4`
- `Ford Figo Titanium1.5 TDCi`
- `Ford Freestyle Titanium Plus 1.2 Ti-VCT [2018-2020]`
- `Ford Mustang GT Fastback 5.0L v8`
- `full_model_name`
- `Honda`
- `Honda Accord 2.4 AT`
- `Honda Accord 3.0 V6 AT`
- `Honda Amaze 1.2 S AT i-VTEC`
- `Honda Amaze 1.2 S i-VTEC`
- `Honda Amaze 1.2 S i-VTEC Opt`
- `Honda Amaze 1.2 V MT Petrol [2018-2020]`
- `Honda Amaze 1.2 VX AT i-VTEC`
- `Honda Amaze 1.2 VX i-VTEC`
- `Honda Amaze 1.5 S i-DTEC`
- `Honda Amaze 1.5 VX i-DTEC`
- `Honda BR-V V CVT Petrol`
- `Honda BR-V VX Diesel`
- `Honda Brio EX MT`
- `Honda Brio S MT`
- `Honda Brio S(O)MT`
- `Honda Brio V MT`
- `Honda Brio VX AT`
- `Honda City 1.5 E MT`
- `Honda City 1.5 S AT`
- `Honda City 1.5 S MT`
- `Honda City 1.5 V AT`
- `Honda City 1.5 V MT`
- `Honda City E`
- `Honda City S Diesel`
- `Honda City SV`
- `Honda City SV Diesel`
- `Honda City V`
- `Honda City V Diesel`
- `Honda City V Petrol`
- `Honda City V Petrol [2017-2019]`
- `Honda City VX`
- `Honda City VX (O) MT`
- `Honda City VX (O) MT BL`
- `Honda City VX (O) MT Diesel`
- `Honda City VX CVT`
- `Honda City VX Diesel`
- `Honda City ZX CVT Petrol [2017-2019]`
- `Honda City ZX Petrol [2019-2019]`
- `Honda City ZX VTEC`
- `Honda Civic 1.8V AT`
- `Honda CR-V 2.0 2WD`
- `Honda CR-V 2.0L 2WD AT`
- `Honda CR-V 2.4 AT`
- `Honda CR-V 2.4 MT`
- `Honda CR-V 2.4L 4WD AVN`
- `Honda Jazz S`
- `Honda Jazz S MT [2015-2016]`
- `Honda Jazz SV Petrol`
- `Honda Jazz V AT Petrol`
- `Honda Jazz V Diesel`
- `Honda Jazz V Petrol`
- `Honda Jazz VX CVT Petrol`
- `Honda Jazz VX Diesel`
- `Honda Jazz VX Petrol`
- `Honda WR-V S MT Petrol`
- `Honda WR-V VX MT Diesel`
- `Honda WR-V VX MT Petrol`
- `Hyundai`
- `Hyundai Creta 1.4 S`
- `Hyundai Creta 1.6 S Plus AT`
- `Hyundai Creta 1.6 SX`
- `Hyundai Creta 1.6 SX Plus`
- `Hyundai Creta 1.6 SX Plus AT`
- `Hyundai Creta 1.6 SX Plus AT Petrol`
- `Hyundai Creta 1.6 SX Plus Petrol`
- `Hyundai Creta 1.6 SX Plus Special Edition`
- `Hyundai Creta E Plus 1.6 Petrol`
- `Hyundai Creta EX 1.4 CRDi`
- `Hyundai Creta S 1.6 AT CRDi`
- `Hyundai Creta S Plus 1.4 CRDI`
- `Hyundai Creta SX (O) 1.4 Turbo 7 DCT`
- `Hyundai Creta SX (O) 1.4 Turbo 7 DCT Dual Tone`
- `Hyundai Creta SX (O) 1.5 Diesel`
- `Hyundai Creta SX (O) 1.5 Diesel Automatic`
- `Hyundai Creta SX (O) 1.5 Petrol CVT`
- `Hyundai Creta SX 1.5 Diesel`
- `Hyundai Creta SX 1.5 Petrol`
- `Hyundai Creta SX 1.6 (O) Petrol`
- `Hyundai Creta SX 1.6 AT Petrol`
- `Hyundai Creta SX 1.6 CRDI`
- `Hyundai Creta SX 1.6 CRDi`
- `Hyundai Creta SX 1.6 CRDi (O)`
- `Hyundai Creta SX 1.6 CRDI (O)`
- `Hyundai Creta SX 1.6 Petrol`
- `Hyundai Creta SX Plus 1.6 AT CRDI`
- `Hyundai Creta SX Plus 1.6 CRDI Dual Tone`
- `Hyundai Creta SX Plus 1.6 Petrol`
- `Hyundai Elantra 1.6 SX AT`
- `Hyundai Elite i20 Asta 1.2`
- `Hyundai Elite i20 Asta 1.2 (O) [2016]`
- `Hyundai Elite i20 Asta 1.2 [2016-2017]`
- `Hyundai Elite i20 Asta 1.4 (O) CRDi`
- `Hyundai Elite i20 Asta 1.4 CRDI`
- `Hyundai Elite i20 Era 1.2`
- `Hyundai Elite i20 Magna 1.2`
- `Hyundai Elite i20 Magna 1.2 [2016-2017]`
- `Hyundai Elite i20 Magna 1.4 CRDI`
- `Hyundai Elite i20 Magna Executive 1.2`
- `Hyundai Elite i20 Magna Plus 1.2 [2019-2020]`
- `Hyundai Elite i20 Sportz 1.2`
- `Hyundai Elite i20 Sportz 1.2 (O)`
- `Hyundai Elite i20 Sportz 1.2 [2016-2017]`
- `Hyundai Eon D-Lite`
- `Hyundai Eon D-Lite +`
- `Hyundai Eon Era +`
- `Hyundai Eon Era + SE`
- `Hyundai Eon Magna [2011-2012]`
- `Hyundai Fluidic Verna 4S 1.6 VTVT S`
- `Hyundai Grand i10 Asta 1.1 CRDi [2013-2016]`
- `Hyundai Grand i10 Asta 1.2 Kappa VTVT (O) [2013-2017]`
- `Hyundai Grand i10 Asta 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Asta AT 1.2 Kappa VTVT (O) [2016-2017]`
- `Hyundai Grand i10 Asta AT 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Era U2 1.2 CRDi`
- `Hyundai Grand i10 Magna 1.1 CRDi [2016-2017]`
- `Hyundai Grand i10 Magna 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Magna 1.2 Kappa VTVT [2016-2017]`
- `Hyundai Grand i10 Sports Edition 1.2L Kappa VTVT`
- `Hyundai Grand i10 Sportz (O) 1.2 Kappa VTVT [2017-2018]`
- `Hyundai Grand i10 Sportz (O) AT 1.2 Kappa VTVT [2017-2018]`
- `Hyundai Grand i10 Sportz 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Sportz 1.2 Kappa VTVT [2016-2017]`
- `Hyundai Grand i10 Sportz AT 1.2 Kappa VTVT`
- `Hyundai Grand i10 Sportz U2 1.2 CRDi`
- `Hyundai i10 1.1L iRDE Magna Special Edition`
- `Hyundai i10 Asta 1.2 AT with Sunroof`
- `Hyundai i10 Era 1.1 iRDE2 [2010-2017]`
- `Hyundai i10 Magna`
- `Hyundai i10 Magna 1.2`
- `Hyundai i10 Magna 1.2 AT`
- `Hyundai i10 Magna 1.2 Kappa2`
- `Hyundai i10 Sportz 1.1 iRDE2 [2010--2017]`
- `Hyundai i10 Sportz 1.2`
- `Hyundai i10 Sportz 1.2 Kappa2`
- `Hyundai i20 Active 1.2 S`
- `Hyundai i20 Active 1.2 SX`
- `Hyundai i20 Active 1.4 S`
- `Hyundai i20 Active 1.4L SX (O) [2015-2016]`
- `Hyundai i20 Asta 1.2`
- `Hyundai i20 Magna 1.2`
- `Hyundai i20 Magna 1.4 CRDI`
- `Hyundai i20 Sportz 1.2 BS-IV`
- `Hyundai i20 Sportz 1.4 CRDI`
- `Hyundai Santro Sportz AMT [2018-2020]`
- `Hyundai Santro Xing GLS`
- `Hyundai Santro Xing XL eRLX - Euro III`
- `Hyundai Tucson 2WD AT GLS Diesel`
- `Hyundai Tucson GL 2WD AT Petrol`
- `Hyundai Tucson GLS 2WD AT Petrol`
- `Hyundai Venue S 1.2 Petrol [2019-2020]`
- `Hyundai Venue SX 1.0 Turbo iMT`
- `Hyundai Venue SX Plus 1.0 Turbo DCT`
- `Hyundai Verna 1.6 CRDI SX`
- `Hyundai Verna 1.6 CRDI SX (O)`
- `Hyundai Verna 1.6 VTVT S`
- `Hyundai Verna 1.6 VTVT SX`
- `Hyundai Verna 1.6 VTVT SX (O)`
- `Hyundai Verna CRDI VGT SX 1.5`
- `Hyundai Verna EX 1.4 VTVT`
- `Hyundai Verna Fluidic 1.4 VTVT`
- `Hyundai Verna Fluidic 1.6 CRDi`
- `Hyundai Verna Fluidic 1.6 CRDi SX`
- `Hyundai Verna Fluidic 1.6 CRDi SX Opt`
- `Hyundai Verna Fluidic 1.6 CRDi SX Opt AT`
- `Hyundai Verna Fluidic 1.6 VTVT SX`
- `Hyundai Verna Fluidic 1.6 VTVT SX Opt AT`
- `Hyundai Verna SX (O) 1.6 CRDi AT`
- `Hyundai Verna SX Plus 1.6 VTVT AT`
- `Hyundai Verna VGT CRDi SX ABS`
- `Hyundai Verna Xi`
- `Hyundai Xcent S 1.1 CRDi`
- `Hyundai Xcent S 1.1 CRDi Special Edition`
- `Hyundai Xcent S 1.2`
- `Hyundai Xcent S AT 1.2`
- `Hyundai Xcent S AT 1.2 (O)`
- `Hyundai Xcent SX 1.2 (O)`
- `Isuzu`
- `Isuzu MU-X 4x4`
- `Jaguar`
- `Jaguar F-Pace Prestige`
- `Jaguar F-Pace Prestige [2016-2017]`
- `Jaguar XE Portfolio Diesel`
- `Jaguar XE Prestige`
- `Jaguar XE Prestige Diesel`
- `Jaguar XF 2.2 Diesel`
- `Jaguar XF 2.2 Diesel Luxury`
- `Jaguar XF 3.0 V6 Premium Luxury`
- `Jaguar XF Petrol 2.0`
- `Jaguar XF Portfolio Diesel`
- `Jaguar XJ L 3.0 Portfolio`
- `Jaguar XJ L 5.0 Petrol SC Supersport`
- `Jeep`
- `Jeep Compass Limited (O) 1.4 Petrol AT [2017-2020]`
- `Jeep Compass Limited 2.0 Diesel [2017-2020]`
- `Jeep Compass Limited Plus 2.0 Diesel 4x4 AT`
- `Jeep Compass Limited Plus Petrol AT [2018-2020]`
- `Jeep Compass Longitude (O) 2.0 Diesel [2017-2020]`
- `Jeep Compass Trailhawk 2.0 4x4`
- `Kia`
- `Kia Seltos GTX 1.4 Dual Tone`
- `Kia Seltos GTX Plus 1.4 [2020-2021]`
- `Kia Seltos GTX Plus AT 1.4 [2019-2020]`
- `Kia Seltos GTX Plus AT 1.5 Diesel [2019-2020]`
- `Kia Seltos HTK Plus AT 1.5 Diesel [2020-2021]`
- `Kia Sonet GTX Plus 1.0 iMT [2020-2021]`
- `Kia Sonet GTX Plus 1.5 [2020-2021]`
- `Lamborghini`
- `Lamborghini Gallardo India Ltd Edition LP 550-2`
- `Land Rover`
- `Land Rover Discovery Sport HSE`
- `Land Rover Discovery Sport HSE Luxury 7-Seater`
- `Land Rover Freelander 2 SE`
- `Land Rover Range Rover 3.0 V6 Diesel Vogue`
- `Land Rover Range Rover 4.4 SDV8 Vogue SE`
- `Land Rover Range Rover Evoque Dynamic SD4`
- `Land Rover Range Rover Evoque HSE`
- `Land Rover Range Rover Evoque HSE Dynamic`
- `Land Rover Range Rover Evoque Prestige SD4`
- `Land Rover Range Rover Evoque S [2020-2021]`
- `Land Rover Range Rover Evoque SE Dynamic`
- `Land Rover Range Rover Sport SE 3.0 Diesel [2018-2020]`
- `Lexus`
- `Lexus ES 300h`
- `Lexus NX 300h Luxury [2017-2020]`
- `Mahindra`
- `Mahindra Alturas G4 2WD AT [2018-2020]`
- `Mahindra Bolero Power Plus SLE [2016-2019]`
- `Mahindra Bolero SLX BS IV`
- `Mahindra Jeep CJ 500 D`
- `Mahindra KUV100 K6 D 5 STR`
- `Mahindra KUV100 K6 D 5 STR [2016-2017]`
- `Mahindra KUV100 NXT K4 Plus 6 STR [2017-2020]`
- `Mahindra KUV100 NXT K8 D 6 STR`
- `Mahindra Quanto C8`
- `Mahindra Scorpio S11 2WD 7 STR`
- `Mahindra Scorpio S11 2WD 8 STR`
- `Mahindra Scorpio S7 140 2WD 7 STR`
- `Mahindra Scorpio SLE 2.6 CRDe`
- `Mahindra Scorpio SLE BS-III`
- `Mahindra Scorpio VLX 4WD Airbag BS-IV`
- `Mahindra Scorpio VLX Special Edition BS-IV`
- `Mahindra Thar CRDe 4x4 AC`
- `Mahindra Thar CRDe 4x4 AC1`
- `Mahindra Thar DI 4WD PS BS III`
- `Mahindra Thar LX 4-STR Convertible Petrol AT`
- `Mahindra Thar LX 4-STR Hard Top Diesel MT`
- `Mahindra Thar LX 4-STR Hard Top Petrol AT`
- `Mahindra TUV300 T6 Plus`
- `Mahindra TUV300 T8`
- `Mahindra TUV300 T8 AMT mHAWK100`
- `Mahindra Verito 1.5 D4 BS-IV`
- `Mahindra XUV300 1.2 W6 [2019-2019]`
- `Mahindra XUV300 1.5 W8 (O) [2019-2020]`
- `Mahindra XUV300 1.5 W8 (O) AMT [2019-2020]`
- `Mahindra XUV500 W10`
- `Mahindra XUV500 W10 AT`
- `Mahindra XUV500 W10 AT 1.99`
- `Mahindra XUV500 W10 AT Black Interiors [2017]`
- `Mahindra XUV500 W10 AWD`
- `Mahindra XUV500 W10 AWD AT`
- `Mahindra XUV500 W11`
- `Mahindra XUV500 W11 AT`
- `Mahindra XUV500 W11(O) [2018-2020]`
- `Mahindra XUV500 W5 [2018-2020]`
- `Mahindra XUV500 W6`
- `Mahindra XUV500 W6 AT 1.99`
- `Mahindra XUV500 W7 [2018-2020]`
- `Mahindra XUV500 W8`
- `Mahindra XUV500 W8 [2015-2017]`
- `Mahindra XUV500 W8 AWD`
- `Mahindra XUV500 W9 1.99`
- `Mahindra XUV500 W9 [2018-2020]`
- `Mahindra-Renault`
- `Mahindra-Renault Logan DLE 1.5 dci`
- `Maruti Suzuki`
- `Maruti Suzuki A-Star Vxi`
- `Maruti Suzuki Alto 800 Lxi`
- `Maruti Suzuki Alto 800 Lxi (Airbag) [2012-2015]`
- `Maruti Suzuki Alto 800 Lxi CNG`
- `Maruti Suzuki Alto 800 Vxi`
- `Maruti Suzuki Alto K10 LXi`
- `Maruti Suzuki Alto K10 VXi`
- `Maruti Suzuki Alto K10 VXi AMT (Airbag) [2014-2019]`
- `Maruti Suzuki Alto K10 VXi AMT [2014-2018]`
- `Maruti Suzuki Alto LXi BS-III`
- `Maruti Suzuki Alto LXi BS-IV`
- `Maruti Suzuki Baleno Alpha 1.2`
- `Maruti Suzuki Baleno Alpha 1.3`
- `Maruti Suzuki Baleno Delta 1.2`
- `Maruti Suzuki Baleno Delta 1.2 AT`
- `Maruti Suzuki Baleno Delta 1.3`
- `Maruti Suzuki Baleno Delta Automatic`
- `Maruti Suzuki Baleno Zeta`
- `Maruti Suzuki Baleno Zeta 1.2`
- `Maruti Suzuki Baleno Zeta 1.2 AT`
- `Maruti Suzuki Baleno Zeta 1.3`
- `Maruti Suzuki Celerio VXi`
- `Maruti Suzuki Celerio VXi [2017-2019]`
- `Maruti Suzuki Celerio VXi AMT`
- `Maruti Suzuki Celerio VXi AMT [2017-2019]`
- `Maruti Suzuki Celerio VXi AMT ABS`
- `Maruti Suzuki Celerio VXi CNG [2019-2020]`
- `Maruti Suzuki Celerio ZXi`
- `Maruti Suzuki Celerio ZXi [2017-2019]`
- `Maruti Suzuki Celerio ZXi AMT [2017-2019]`
- `Maruti Suzuki Celerio ZXi AMT [2019-2020]`
- `Maruti Suzuki Ciaz Alpha 1.3 Hybrid`
- `Maruti Suzuki Ciaz Alpha 1.4 AT`
- `Maruti Suzuki Ciaz Alpha 1.4 MT`
- `Maruti Suzuki Ciaz Delta 1.3 Hybrid`
- `Maruti Suzuki Ciaz Delta Hybrid 1.5 [2018-2020]`
- `Maruti Suzuki Ciaz VDi SHVS`
- `Maruti Suzuki Ciaz VXi (O)`
- `Maruti Suzuki Ciaz ZDi SHVS`
- `Maruti Suzuki Ciaz ZDi+ SHVS RS [2015-2017]`
- `Maruti Suzuki Ciaz Zeta 1.4 AT`
- `Maruti Suzuki Ciaz ZXi`
- `Maruti Suzuki Ciaz ZXi (O) [2014-2015]`
- `Maruti Suzuki Ciaz ZXi AT`
- `Maruti Suzuki Ciaz ZXI+`
- `Maruti Suzuki Dzire VDi`
- `Maruti Suzuki Dzire VXi AMT`
- `Maruti Suzuki Dzire ZDi`
- `Maruti Suzuki Dzire ZDi AMT`
- `Maruti Suzuki Eeco 5 STR WITH A/C+HTR [2019-2020]`
- `Maruti Suzuki Ertiga VDi`
- `Maruti Suzuki Ertiga VDI SHVS`
- `Maruti Suzuki Ertiga VXi`
- `Maruti Suzuki Ertiga VXI CNG`
- `Maruti Suzuki Ertiga ZDi`
- `Maruti Suzuki Ertiga ZDI + SHVS`
- `Maruti Suzuki Ertiga ZDi Plus 1.5 Diesel`
- `Maruti Suzuki Estilo LXi BS-IV`
- `Maruti Suzuki Estilo VXi`
- `Maruti Suzuki Ignis Sigma 1.2 MT`
- `Maruti Suzuki Ignis Zeta 1.2 MT`
- `Maruti Suzuki Ritz Ldi BS-IV`
- `Maruti Suzuki Ritz Vdi BS-IV`
- `Maruti Suzuki Ritz VXI BS-IV`
- `Maruti Suzuki Ritz Zxi BS-IV`
- `Maruti Suzuki S-Cross Alpha 1.6`
- `Maruti Suzuki S-Cross Zeta 1.3`
- `Maruti Suzuki Swift Dzire LDI`
- `Maruti Suzuki Swift Dzire LXI`
- `Maruti Suzuki Swift DZire VDI`
- `Maruti Suzuki Swift Dzire VDI`
- `Maruti Suzuki Swift Dzire VDi BS-IV`
- `Maruti Suzuki Swift DZire VXI`
- `Maruti Suzuki Swift Dzire VXI`
- `Maruti Suzuki Swift Dzire VXI AT ABS`
- `Maruti Suzuki Swift Dzire ZDI AMT`
- `Maruti Suzuki Swift Dzire ZXI`
- `Maruti Suzuki Swift LDi`
- `Maruti Suzuki Swift LXi`
- `Maruti Suzuki Swift VDi`
- `Maruti Suzuki Swift VDi [2014-2017]`
- `Maruti Suzuki Swift VDi ABS [2014-2017]`
- `Maruti Suzuki Swift VDi BS-IV`
- `Maruti Suzuki Swift VXi`
- `Maruti Suzuki Swift VXi [2014-2017]`
- `Maruti Suzuki Swift VXi AMT`
- `Maruti Suzuki Swift VXi AMT [2018-2019]`
- `Maruti Suzuki Swift ZDi`
- `Maruti Suzuki Swift ZXi`
- `Maruti Suzuki Swift ZXi 1.2 BS-IV`
- `Maruti Suzuki SX4 VDI`
- `Maruti Suzuki SX4 VXi`
- `Maruti Suzuki SX4 ZXi`
- `Maruti Suzuki Vitara Brezza LDi`
- `Maruti Suzuki Vitara Brezza LDi (O) [2016-2018]`
- `Maruti Suzuki Vitara Brezza VDi`
- `Maruti Suzuki Vitara Brezza VDi (O) [2016-2018]`
- `Maruti Suzuki Vitara Brezza VXi`
- `Maruti Suzuki Vitara Brezza ZDi`
- `Maruti Suzuki Vitara Brezza ZDi Plus`
- `Maruti Suzuki Vitara Brezza ZDi Plus Dual Tone AGS`
- `Maruti Suzuki Vitara Brezza ZDi+ Dual Tone [2017-2018]`
- `Maruti Suzuki Wagon R 1.0 LXi`
- `Maruti Suzuki Wagon R 1.0 LXI`
- `Maruti Suzuki Wagon R 1.0 LXi CNG`
- `Maruti Suzuki Wagon R 1.0 VXI`
- `Maruti Suzuki Wagon R 1.0 VXi`
- `Maruti Suzuki Wagon R 1.0 VXI AMT`
- `Maruti Suzuki Wagon R 1.0 VXI+ (O)`
- `Maruti Suzuki Wagon R LXi Minor`
- `Maruti Suzuki Wagon R VXi Minor`
- `Maruti Suzuki XL6 Alpha AT Petrol`
- `Mercedes-Benz`
- `Mercedes-Benz A-Class A 180 CDI Style`
- `Mercedes-Benz B-Class B180`
- `Mercedes-Benz C-Class 200 K AT`
- `Mercedes-Benz C-Class 220 CDI AT`
- `Mercedes-Benz C-Class 220 CDI Sport`
- `Mercedes-Benz C-Class 250 CDI`
- `Mercedes-Benz C-Class 250 CDI Elegance`
- `Mercedes-Benz C-Class C 200 Avantgarde`
- `Mercedes-Benz C-Class C 220 CDI Avantgarde`
- `Mercedes-Benz C-Class C 220d Progressive [2018-2019]`
- `Mercedes-Benz C-Class C 250 CDI BlueEFFICIENCY`
- `Mercedes-Benz CLA 200 CDI Sport`
- `Mercedes-Benz CLA 200 CDI Sport (CBU)`
- `Mercedes-Benz CLA 200 D Urban Sport`
- `Mercedes-Benz CLA 200 Petrol Sport`
- `Mercedes-Benz CLA 200 Petrol Sport (CBU)`
- `Mercedes-Benz CLA 45 AMG 4MATIC [2017-2017]`
- `Mercedes-Benz CLS 250 CDI`
- `Mercedes-Benz E-Class 220 CDI AT`
- `Mercedes-Benz E-Class E 200`
- `Mercedes-Benz E-Class E 220 d Avantgarde`
- `Mercedes-Benz E-Class E 220d Exclusive [2019-2019]`
- `Mercedes-Benz E-Class E 220d Expression [2019-2019]`
- `Mercedes-Benz E-Class E 250 CDI Avantgarde`
- `Mercedes-Benz E-Class E 250 CDI Edition E`
- `Mercedes-Benz E-Class E 350 d Exclusive [2017-2019]`
- `Mercedes-Benz E-Class E200`
- `Mercedes-Benz E-Class E200 CGI Blue Efficiency`
- `Mercedes-Benz E-Class E220 CDI Blue Efficiency`
- `Mercedes-Benz E-Class E250 CDI Avantgarde`
- `Mercedes-Benz E-Class E250 Elegance`
- `Mercedes-Benz E-Class E350`
- `Mercedes-Benz E-Class E350 Cabriolet`
- `Mercedes-Benz E-Class E350 CDI Avantgarde`
- `Mercedes-Benz G-Class G 63 AMG`
- `Mercedes-Benz GL 350 CDI`
- `Mercedes-Benz GL 350 CDI BlueEFFICIENCY`
- `Mercedes-Benz GLA 200 CDI Sport`
- `Mercedes-Benz GLA 200 Sport`
- `Mercedes-Benz GLA 220 d 4MATIC`
- `Mercedes-Benz GLC 220 d Progressive`
- `Mercedes-Benz GLC 220 d Sport`
- `Mercedes-Benz GLC 220d 4MATIC Progressive [2019-2021]`
- `Mercedes-Benz GLE 250 d`
- `Mercedes-Benz GLE Coupe 43 4MATIC [2017-2019]`
- `Mercedes-Benz GLS 350 d`
- `Mercedes-Benz M-Class 320 CDI`
- `Mercedes-Benz M-Class 350`
- `Mercedes-Benz M-Class 350 CDI`
- `Mercedes-Benz M-Class ML 350 CDI`
- `Mercedes-Benz S-Class (W222) S 350D [2018-2020]`
- `Mercedes-Benz S-Class 320 CDI`
- `Mercedes-Benz S-Class 350`
- `Mercedes-Benz S-Class 350 CDI L`
- `Mercedes-Benz S-Class S 350 CDI`
- `Mercedes-Benz S-Class S 400`
- `Mercedes-Benz S-Class S 63 AMG`
- `Mercedes-Benz SLK 350`
- `MG`
- `MG Hector Plus Sharp 1.5 DCT Petrol`
- `MG Hector Sharp 1.5 DCT Petrol [2019-2020]`
- `MG Hector Sharp 2.0 Diesel [2019-2020]`
- `MG Hector Super Hybrid 1.5 Petrol [2019-2020]`
- `MINI`
- `MINI Cooper 1.6`
- `MINI Cooper Countryman Cooper D`
- `MINI Cooper Countryman one`
- `MINI Cooper S`
- `MINI Countryman Cooper D`
- `MINI Countryman Cooper S [2020-2021]`
- `Mitsubishi`
- `Mitsubishi Outlander 2.4 MIVEC`
- `Mitsubishi Pajero Sport 2.5 AT`
- `Nissan`
- `Nissan Micra Active XL`
- `Nissan Micra Active XV`
- `Nissan Micra XE Petrol`
- `Nissan Micra XV CVT [2016-2017]`
- `Nissan Sunny XL`
- `Nissan Sunny XV CVT`
- `Nissan Sunny XV Diesel`
- `Nissan Terrano XL (P)`
- `Porsche`
- `Porsche 718 Cayman [2017-2020]`
- `Porsche Cayenne Diesel`
- `Porsche Cayenne Platinum Edition Diesel`
- `Porsche Cayenne S`
- `Porsche Cayenne S V8 Tiptronic`
- `Renault`
- `Renault Captur RXT Diesel Dual Tone`
- `Renault Duster 110 PS RxL Diesel`
- `Renault Duster 110 PS RXZ 4X2 AMT Diesel`
- `Renault Duster 110 PS RXZ 4X2 MT Diesel`
- `Renault Duster 110 PS RXZ 4X4 MT Diesel`
- `Renault Duster 110 PS RxZ AWD`
- `Renault Duster 110 PS RxZ AWD Diesel`
- `Renault Duster 110 PS RxZ Diesel`
- `Renault Duster 85 PS RxE`
- `Renault Duster 85 PS RxL Diesel`
- `Renault Duster 85 PS RXS 4X2 MT Diesel`
- `Renault Duster RXL Petrol`
- `Renault Duster RXS CVT`
- `Renault Kwid 1.0 RXL AMT [2017-2019]`
- `Renault Kwid 1.0 RXT AMT Opt [2016-2019]`
- `Renault Kwid 1.0 RXT Opt [2016-2019]`
- `Renault Kwid CLIMBER 1.0 [2017-2019]`
- `Renault Kwid RXT [2015-2019]`
- `Renault Lodgy 110 PS RxL [2015-2016]`
- `Renault Lodgy 110 PS RXZ [2015-2016]`
- `Renault Lodgy 85 PS RXZ [2015-2016]`
- `Renault Pulse RxL Petrol [2015-2017]`
- `Renault Pulse RxZ Airbags`
- `Renault Triber RXZ [2019-2020]`
- `Skoda`
- `Skoda Fabia Elegance 1.2 MPI`
- `Skoda Laura Ambiente 1.9 TDI AT`
- `Skoda Laura Ambition 1.8 TSI`
- `Skoda Octavia 2.0 TDI CR Ambition Plus AT`
- `Skoda Octavia 2.0 TDI CR Style Plus AT [2017]`
- `Skoda Octavia 2.0 TDI L&K`
- `Skoda Rapid 1.5 TDI CR Ambition with Alloy Wheels`
- `Skoda Rapid 1.5 TDI CR Elegance AT`
- `Skoda Rapid 1.5 TDI CR Style Plus AT`
- `Skoda Rapid 1.6 MPI Ambition with Alloy Wheels`
- `Skoda Rapid Active 1.6 MPI MT`
- `Skoda Rapid Ambition 1.5 TDI`
- `Skoda Rapid Ambition 1.5 TDI AT`
- `Skoda Rapid Ambition 1.6 MPI MT`
- `Skoda Rapid Ambition 1.6 TDI CR MT`
- `Skoda Rapid Elegance 1.6 TDI CR MT`
- `Skoda Rapid Monte Carlo 1.5 TDI AT`
- `Skoda Rapid Monte Carlo 1.6 MPI AT`
- `Skoda Rapid Monte Carlo 1.6 MPI MT`
- `Skoda Rapid ONYX 1.5 TDI LE`
- `Skoda Rapid Style 1.5 TDI AT`
- `Skoda Rapid Style 1.6 MPI AT`
- `Skoda Superb Elegance 1.8 TSI AT`
- `Skoda Superb Elegance 1.8 TSI MT`
- `Skoda Superb Elegance 2.0 TDI CR AT`
- `Skoda Superb Elegance TSI AT`
- `Skoda Superb L&K TSI AT`
- `Skoda Yeti Ambition 2.0 TDI CR 4x2`
- `Skoda Yeti Ambition 2.0 TDI CR 4x4`
- `Skoda Yeti Elegance 2.0 TDI CR 4x4`
- `Tata`
- `Tata Altroz XZ (O) Petrol`
- `Tata Aria Pure 4x2`
- `Tata Harrier XZ [2019-2020]`
- `Tata Hexa XT 4x2 7 STR`
- `Tata Hexa XT 4x4 7 STR`
- `Tata Hexa XTA 4x2 6 STR`
- `Tata Hexa XTA 4x2 7 STR`
- `Tata Indica Vista Aura + Quadrajet BS-III`
- `Tata Indica Vista LX TDI BS-III`
- `Tata Nano Base`
- `Tata Nano LX`
- `Tata Nano Twist XT`
- `Tata Nexon KRAZ Plus AMT Diesel`
- `Tata Nexon XM`
- `Tata Nexon XM Diesel`
- `Tata Nexon XZ Plus Diesel`
- `Tata Nexon XZ Plus Diesel Dual Tone`
- `Tata Safari Storme 2.2 VX 4x2`
- `Tata Safari Storme 2019 2.2 VX 4x2 Varicor400`
- `Tata Safari XZA Plus`
- `Tata Tiago Revotron XZ`
- `Tata Tiago Revotron XZA [2017-2019]`
- `Tata Tigor Revotron XZA`
- `Tata Zest XMA Diesel`
- `Tata Zest XT Petrol`
- `Toyota`
- `Toyota Camry ACV30R`
- `Toyota Camry Hybrid`
- `Toyota Corolla Altis 1.8 G`
- `Toyota Corolla Altis 1.8 VL AT`
- `Toyota Corolla Altis G Diesel`
- `Toyota Corolla Altis GL Petrol`
- `Toyota Corolla Altis JS Petrol`
- `Toyota Corolla Altis VL AT Petrol`
- `Toyota Corolla H2 1.8E`
- `Toyota Etios Cross 1.2 G`
- `Toyota Etios G`
- `Toyota Etios GD`
- `Toyota Etios Liva G SP*`
- `Toyota Etios Liva GD`
- `Toyota Etios Liva V`
- `Toyota Etios Liva VXD`
- `Toyota Etios VX-D`
- `Toyota Fortuner 2.5 Sportivo 4x2 MT`
- `Toyota Fortuner 2.7 4x2 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x2 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x2 MT [2016-2020]`
- `Toyota Fortuner 2.8 4x4 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x4 MT [2016-2020]`
- `Toyota Fortuner 3.0 4x2 MT`
- `Toyota Fortuner 3.0 MT`
- `Toyota Glanza V`
- `Toyota Innova 2.5 E 7 STR`
- `Toyota Innova 2.5 E 8 STR`
- `Toyota Innova 2.5 EV PS 7 STR BS-IV`
- `Toyota Innova 2.5 G 7 STR BS-IV`
- `Toyota Innova 2.5 G BS IV 7 STR`
- `Toyota Innova 2.5 G4 7 STR`
- `Toyota Innova 2.5 G4 8 STR`
- `Toyota Innova 2.5 GX BS III 8 STR`
- `Toyota Innova 2.5 V 7 STR`
- `Toyota Innova 2.5 V 8 STR`
- `Toyota Innova 2.5 VX 7 STR BS-III`
- `Toyota Innova 2.5 VX 8 STR BS-III`
- `Toyota Innova 2.5 VX 8 STR BS-IV`
- `Toyota Innova 2.5 VX BS IV 7 STR`
- `Toyota Innova Crysta 2.4 G 7 STR [2016-2017]`
- `Toyota Innova Crysta 2.4 VX 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 VX 8 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 ZX 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 ZX AT 7 STR`
- `Toyota Innova Crysta 2.7 GX AT 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.7 ZX AT 7 STR`
- `Toyota Innova Crysta 2.8 GX AT 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.8 GX AT 8 STR [2016-2020]`
- `Toyota Innova Crysta 2.8 ZX AT 7 STR [2016-2020]`
- `Toyota Land Cruiser LC 200 VX`
- `Toyota Qualis GS G1`
- `Toyota Yaris J CVT [2018-2020]`
- `Volkswagen`
- `Volkswagen Ameo Comfortline 1.2L (P)`
- `Volkswagen Ameo Highline1.5L (D) [2016-2018]`
- `Volkswagen Ameo Trendline 1.2L (P)`
- `Volkswagen Cross Polo 1.2 TDI`
- `Volkswagen Cross Polo 1.5 TDI`
- `Volkswagen Jetta Comfortline TDI`
- `Volkswagen Jetta Highline TDI`
- `Volkswagen Jetta Highline TDI AT`
- `Volkswagen Passat Highline`
- `Volkswagen Passat Highline DSG`
- `Volkswagen Polo Comfortline 1.2L (D)`
- `Volkswagen Polo Comfortline 1.2L (P)`
- `Volkswagen Polo Comfortline 1.5L (D)`
- `Volkswagen Polo GT TDI`
- `Volkswagen Polo GT TSI`
- `Volkswagen Polo Highline Plus 1.2( P)16 Alloy [2017-2018]`
- `Volkswagen Polo Highline1.0L (P)`
- `Volkswagen Polo Highline1.2L (D)`
- `Volkswagen Polo Highline1.2L (P)`
- `Volkswagen Polo Highline1.5L (D)`
- `Volkswagen Polo Trendline 1.2L (P)`
- `Volkswagen Tiguan - 2020 Highline TDI`
- `Volkswagen Vento Comfortline Diesel`
- `Volkswagen Vento Comfortline Petrol AT`
- `Volkswagen Vento Highline Diesel`
- `Volkswagen Vento Highline Diesel AT [2015-2016]`
- `Volkswagen Vento Highline Petrol`
- `Volkswagen Vento Highline Petrol AT`
- `Volkswagen Vento Highline Plus 1.2 (P) AT 16 Alloy`
- `Volkswagen Vento Highline Plus 1.5 (D) 16 Alloy`
- `Volkswagen Vento Highline Plus 1.5 AT (D) 16 Alloy`
- `Volkswagen Vento Trendline Diesel`
- `Volkswagen Vento TSI`
- `Volvo`
- `Volvo S60 Kinetic D4`
- `Volvo S60 Polestar [2017-2020]`
- `Volvo S60 Summum D5`
- `Volvo S90 Inscription D4 [2016-2020]`
- `Volvo V40 D3 R-Design`
- `Volvo XC60 D5 AWD AT`
- `Volvo XC60 Inscription [2017-2020]`
- `Volvo XC90 D5 AWD`

</details>

<details><summary><code>full_model_name</code>: 919 unique non-missing value(s)</summary>

- `3`
- `4.4`
- `5`
- `6`
- `7`
- `718`
- `A-Class`
- `A-Star`
- `A3`
- `A4`
- `A6`
- `A8`
- `Abarth`
- `Accord`
- `Alto`
- `Altroz`
- `Alturas`
- `Amaze`
- `Ameo`
- `Aria`
- `Aspire`
- `Audi A3 35 TDI Premium`
- `Audi A3 35 TDI Premium + Sunroof`
- `Audi A3 35 TFSI Technology`
- `Audi A4 1.8 TFSI Multitronic Premium Plus`
- `Audi A4 2.0 TDI (143bhp)`
- `Audi A4 2.0 TDI (177bhp) Premium`
- `Audi A4 2.0 TDI (177bhp) Premium Plus`
- `Audi A4 2.0 TDI (177bhp) Premium Sport`
- `Audi A4 2.0 TFSI`
- `Audi A4 35 TDI Premium Plus`
- `Audi A6 2.0 TDI Premium`
- `Audi A6 2.0 TDI Premium Plus`
- `Audi A6 3.0 TDI quattro Premium Plus`
- `Audi A6 35 TDI Matrix`
- `Audi A6 35 TDI Premium`
- `Audi A8 L 3.0 TDI quattro`
- `Audi Q3 2.0 TDI quattro Premium`
- `Audi Q3 2.0 TDI quattro Premium Plus`
- `Audi Q3 30 TDI Premium FWD`
- `Audi Q3 30 TDI S`
- `Audi Q3 35 TDI Premium + Sunroof`
- `Audi Q3 35 TDI Premium Plus`
- `Audi Q3 35 TDI quattro Premium Plus`
- `Audi Q5 2.0 TDI quattro Premium`
- `Audi Q5 2.0 TDI quattro Premium Plus`
- `Audi Q5 2.0 TFSI quattro Premium Plus`
- `Audi Q5 3.0 TDI quattro Premium Plus`
- `Audi Q7 3.0 TDI quattro`
- `Audi Q7 3.0 TDI quattro Premium`
- `Audi Q7 3.0 TDI quattro Premium Plus`
- `Audi Q7 35 TDI Technology Pack`
- `Audi Q7 45 TDI Technology Pack`
- `Avventura`
- `B-Class`
- `Baleno`
- `Beat`
- `Bentley Continental Flying Spur W12`
- `BMW 3 Series 320d`
- `BMW 3 Series 320d Edition Sport`
- `BMW 3 Series 320d Highline Sedan`
- `BMW 3 Series 320d Luxury Line`
- `BMW 3 Series 320d Prestige`
- `BMW 3 Series 320d Sedan`
- `BMW 3 Series 320d Sport Line`
- `BMW 3 Series 325i Sedan`
- `BMW 3 Series GT 320d Luxury Line [2014-2016]`
- `BMW 3 Series GT 330i M Sport [2017-2019]`
- `BMW 5 Series 520d Luxury Line`
- `BMW 5 Series 520d Luxury Line [2017-2019]`
- `BMW 5 Series 520d M Sport`
- `BMW 5 Series 520d Sedan`
- `BMW 5 Series 523i Sedan`
- `BMW 5 Series 530d M Sport [2013-2017]`
- `BMW 6 Series 645i`
- `BMW 6 Series GT 630d M Sport [2018-2019]`
- `BMW 6 Series GT 630i Luxury Line [2018-2019]`
- `BMW 7 Series 730Ld`
- `BMW 7 Series 730Ld DPE`
- `BMW 7 Series 730Ld DPE (CBU)`
- `BMW 7 Series 730Ld DPE Signature`
- `BMW 7 Series 730Ld Eminence`
- `BMW 7 Series 730Ld Prestige`
- `BMW 7 Series 730Ld Sedan`
- `BMW 7 Series 740Li DPE Signature`
- `BMW 7 Series 740Li Sedan`
- `BMW 7 Series 750Li Sedan`
- `BMW X1 sDrive20d`
- `BMW X1 sDrive20d Expedition`
- `BMW X1 sDrive20d Sport Line`
- `BMW X1 sDrive20d xLine`
- `BMW X1 sDrive20i SportX`
- `BMW X1 xDrive20d M Sport`
- `BMW X3 2.5si`
- `BMW X3 xDrive 20d Expedition`
- `BMW X3 xDrive-20d xLine`
- `BMW X3 xDrive20d`
- `BMW X4 M [2019]`
- `BMW X5 SAV 4.4i`
- `BMW X5 xDrive 30d`
- `BMW X5 xDrive30d Pure Experience (5 Seater)`
- `BMW X5 xDrive30d xLine`
- `BMW X5 xDrive35i Pure Experience (5 seater)`
- `BMW X7 xDrive30d DPE Signature [2019-2020]`
- `BMW Z4 Roadster sDrive35i`
- `BMW Z4 sDrive 35i`
- `Bolero`
- `BR-V`
- `Brio`
- `C-Class`
- `Camry`
- `Captur`
- `Cayenne`
- `Celerio`
- `Chevrolet Beat LS Diesel`
- `Chevrolet Beat LS Petrol`
- `Chevrolet Beat LT Petrol`
- `Chevrolet Cruze LTZ AT`
- `Chevrolet Enjoy 1.3 LS 7 STR`
- `Ciaz`
- `City`
- `Civic`
- `CLA`
- `CLS`
- `Compass`
- `Continental`
- `Cooper`
- `Corolla`
- `Countryman`
- `CR-V`
- `Creta`
- `Cross`
- `Cruze`
- `Datsun GO T`
- `Datsun redi-GO T(O) 1.0`
- `Discovery`
- `Duster`
- `Dzire`
- `E-Class`
- `EcoSport`
- `Eeco`
- `Elantra`
- `Elite`
- `Endeavour`
- `Enjoy`
- `Eon`
- `Ertiga`
- `ES`
- `Estilo`
- `Etios`
- `Evoque`
- `F-Pace`
- `Fabia`
- `Fiat Abarth 595 Competizione`
- `Fiat Avventura Emotion Multijet 1.3`
- `Fiesta`
- `Figo`
- `Fluidic`
- `Ford Aspire Titanium1.5 TDCi`
- `Ford EcoSport Ambiente 1.5 TDCi`
- `Ford EcoSport Ambiente 1.5L Ti-VCT`
- `Ford EcoSport Titanium + 1.5L TDCi`
- `Ford EcoSport Titanium + 1.5L Ti-VCT`
- `Ford EcoSport Titanium 1.0 Ecoboost`
- `Ford EcoSport Titanium 1.5 TDCi`
- `Ford EcoSport Titanium 1.5 Ti-VCT`
- `Ford EcoSport Titanium 1.5 Ti-VCT AT`
- `Ford EcoSport Titanium 1.5L TDCi`
- `Ford EcoSport Titanium 1.5L Ti-VCT AT`
- `Ford EcoSport Titanium+ 1.5L TDCi Black Edition`
- `Ford EcoSport Trend + 1.5L TDCi`
- `Ford EcoSport Trend 1.5L TDCi`
- `Ford Endeavour 2.5L 4x2`
- `Ford Endeavour 3.0L 4x4 AT`
- `Ford Endeavour Titanium 2.2 4x2 AT`
- `Ford Endeavour Titanium 2.2 4x2 AT [2016-2018]`
- `Ford Endeavour Titanium 3.2 4x4 AT`
- `Ford Endeavour Titanium Plus 2.0 4x4 AT`
- `Ford Endeavour Trend 3.2 4x4 AT`
- `Ford Fiesta ZXi 1.6`
- `Ford Figo Duratec Petrol Titanium 1.2`
- `Ford Figo Duratorq Diesel Titanium 1.4`
- `Ford Figo Duratorq Diesel ZXI 1.4`
- `Ford Figo Titanium1.5 TDCi`
- `Ford Freestyle Titanium Plus 1.2 Ti-VCT [2018-2020]`
- `Ford Mustang GT Fastback 5.0L v8`
- `Fortuner`
- `Freelander`
- `Freestyle`
- `G-Class`
- `Gallardo`
- `GL`
- `GLA`
- `Glanza`
- `GLC`
- `GLE`
- `GLS`
- `GO`
- `Grand`
- `Harrier`
- `Hector`
- `Hexa`
- `Honda Accord 2.4 AT`
- `Honda Accord 3.0 V6 AT`
- `Honda Amaze 1.2 S AT i-VTEC`
- `Honda Amaze 1.2 S i-VTEC`
- `Honda Amaze 1.2 S i-VTEC Opt`
- `Honda Amaze 1.2 V MT Petrol [2018-2020]`
- `Honda Amaze 1.2 VX AT i-VTEC`
- `Honda Amaze 1.2 VX i-VTEC`
- `Honda Amaze 1.5 S i-DTEC`
- `Honda Amaze 1.5 VX i-DTEC`
- `Honda BR-V V CVT Petrol`
- `Honda BR-V VX Diesel`
- `Honda Brio EX MT`
- `Honda Brio S MT`
- `Honda Brio S(O)MT`
- `Honda Brio V MT`
- `Honda Brio VX AT`
- `Honda City 1.5 E MT`
- `Honda City 1.5 S AT`
- `Honda City 1.5 S MT`
- `Honda City 1.5 V AT`
- `Honda City 1.5 V MT`
- `Honda City E`
- `Honda City S Diesel`
- `Honda City SV`
- `Honda City SV Diesel`
- `Honda City V`
- `Honda City V Diesel`
- `Honda City V Petrol`
- `Honda City V Petrol [2017-2019]`
- `Honda City VX`
- `Honda City VX (O) MT`
- `Honda City VX (O) MT BL`
- `Honda City VX (O) MT Diesel`
- `Honda City VX CVT`
- `Honda City VX Diesel`
- `Honda City ZX CVT Petrol [2017-2019]`
- `Honda City ZX Petrol [2019-2019]`
- `Honda City ZX VTEC`
- `Honda Civic 1.8V AT`
- `Honda CR-V 2.0 2WD`
- `Honda CR-V 2.0L 2WD AT`
- `Honda CR-V 2.4 AT`
- `Honda CR-V 2.4 MT`
- `Honda CR-V 2.4L 4WD AVN`
- `Honda Jazz S`
- `Honda Jazz S MT [2015-2016]`
- `Honda Jazz SV Petrol`
- `Honda Jazz V AT Petrol`
- `Honda Jazz V Diesel`
- `Honda Jazz V Petrol`
- `Honda Jazz VX CVT Petrol`
- `Honda Jazz VX Diesel`
- `Honda Jazz VX Petrol`
- `Honda WR-V S MT Petrol`
- `Honda WR-V VX MT Diesel`
- `Honda WR-V VX MT Petrol`
- `Hyundai Creta 1.4 S`
- `Hyundai Creta 1.6 S Plus AT`
- `Hyundai Creta 1.6 SX`
- `Hyundai Creta 1.6 SX Plus`
- `Hyundai Creta 1.6 SX Plus AT`
- `Hyundai Creta 1.6 SX Plus AT Petrol`
- `Hyundai Creta 1.6 SX Plus Petrol`
- `Hyundai Creta 1.6 SX Plus Special Edition`
- `Hyundai Creta E Plus 1.6 Petrol`
- `Hyundai Creta EX 1.4 CRDi`
- `Hyundai Creta S 1.6 AT CRDi`
- `Hyundai Creta S Plus 1.4 CRDI`
- `Hyundai Creta SX (O) 1.4 Turbo 7 DCT`
- `Hyundai Creta SX (O) 1.4 Turbo 7 DCT Dual Tone`
- `Hyundai Creta SX (O) 1.5 Diesel`
- `Hyundai Creta SX (O) 1.5 Diesel Automatic`
- `Hyundai Creta SX (O) 1.5 Petrol CVT`
- `Hyundai Creta SX 1.5 Diesel`
- `Hyundai Creta SX 1.5 Petrol`
- `Hyundai Creta SX 1.6 (O) Petrol`
- `Hyundai Creta SX 1.6 AT Petrol`
- `Hyundai Creta SX 1.6 CRDI`
- `Hyundai Creta SX 1.6 CRDi`
- `Hyundai Creta SX 1.6 CRDi (O)`
- `Hyundai Creta SX 1.6 CRDI (O)`
- `Hyundai Creta SX 1.6 Petrol`
- `Hyundai Creta SX Plus 1.6 AT CRDI`
- `Hyundai Creta SX Plus 1.6 CRDI Dual Tone`
- `Hyundai Creta SX Plus 1.6 Petrol`
- `Hyundai Elantra 1.6 SX AT`
- `Hyundai Elite i20 Asta 1.2`
- `Hyundai Elite i20 Asta 1.2 (O) [2016]`
- `Hyundai Elite i20 Asta 1.2 [2016-2017]`
- `Hyundai Elite i20 Asta 1.4 (O) CRDi`
- `Hyundai Elite i20 Asta 1.4 CRDI`
- `Hyundai Elite i20 Era 1.2`
- `Hyundai Elite i20 Magna 1.2`
- `Hyundai Elite i20 Magna 1.2 [2016-2017]`
- `Hyundai Elite i20 Magna 1.4 CRDI`
- `Hyundai Elite i20 Magna Executive 1.2`
- `Hyundai Elite i20 Magna Plus 1.2 [2019-2020]`
- `Hyundai Elite i20 Sportz 1.2`
- `Hyundai Elite i20 Sportz 1.2 (O)`
- `Hyundai Elite i20 Sportz 1.2 [2016-2017]`
- `Hyundai Eon D-Lite`
- `Hyundai Eon D-Lite +`
- `Hyundai Eon Era +`
- `Hyundai Eon Era + SE`
- `Hyundai Eon Magna [2011-2012]`
- `Hyundai Fluidic Verna 4S 1.6 VTVT S`
- `Hyundai Grand i10 Asta 1.1 CRDi [2013-2016]`
- `Hyundai Grand i10 Asta 1.2 Kappa VTVT (O) [2013-2017]`
- `Hyundai Grand i10 Asta 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Asta AT 1.2 Kappa VTVT (O) [2016-2017]`
- `Hyundai Grand i10 Asta AT 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Era U2 1.2 CRDi`
- `Hyundai Grand i10 Magna 1.1 CRDi [2016-2017]`
- `Hyundai Grand i10 Magna 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Magna 1.2 Kappa VTVT [2016-2017]`
- `Hyundai Grand i10 Sports Edition 1.2L Kappa VTVT`
- `Hyundai Grand i10 Sportz (O) 1.2 Kappa VTVT [2017-2018]`
- `Hyundai Grand i10 Sportz (O) AT 1.2 Kappa VTVT [2017-2018]`
- `Hyundai Grand i10 Sportz 1.2 Kappa VTVT [2013-2016]`
- `Hyundai Grand i10 Sportz 1.2 Kappa VTVT [2016-2017]`
- `Hyundai Grand i10 Sportz AT 1.2 Kappa VTVT`
- `Hyundai Grand i10 Sportz U2 1.2 CRDi`
- `Hyundai i10 1.1L iRDE Magna Special Edition`
- `Hyundai i10 Asta 1.2 AT with Sunroof`
- `Hyundai i10 Era 1.1 iRDE2 [2010-2017]`
- `Hyundai i10 Magna`
- `Hyundai i10 Magna 1.2`
- `Hyundai i10 Magna 1.2 AT`
- `Hyundai i10 Magna 1.2 Kappa2`
- `Hyundai i10 Sportz 1.1 iRDE2 [2010--2017]`
- `Hyundai i10 Sportz 1.2`
- `Hyundai i10 Sportz 1.2 Kappa2`
- `Hyundai i20 Active 1.2 S`
- `Hyundai i20 Active 1.2 SX`
- `Hyundai i20 Active 1.4 S`
- `Hyundai i20 Active 1.4L SX (O) [2015-2016]`
- `Hyundai i20 Asta 1.2`
- `Hyundai i20 Magna 1.2`
- `Hyundai i20 Magna 1.4 CRDI`
- `Hyundai i20 Sportz 1.2 BS-IV`
- `Hyundai i20 Sportz 1.4 CRDI`
- `Hyundai Santro Sportz AMT [2018-2020]`
- `Hyundai Santro Xing GLS`
- `Hyundai Santro Xing XL eRLX - Euro III`
- `Hyundai Tucson 2WD AT GLS Diesel`
- `Hyundai Tucson GL 2WD AT Petrol`
- `Hyundai Tucson GLS 2WD AT Petrol`
- `Hyundai Venue S 1.2 Petrol [2019-2020]`
- `Hyundai Venue SX 1.0 Turbo iMT`
- `Hyundai Venue SX Plus 1.0 Turbo DCT`
- `Hyundai Verna 1.6 CRDI SX`
- `Hyundai Verna 1.6 CRDI SX (O)`
- `Hyundai Verna 1.6 VTVT S`
- `Hyundai Verna 1.6 VTVT SX`
- `Hyundai Verna 1.6 VTVT SX (O)`
- `Hyundai Verna CRDI VGT SX 1.5`
- `Hyundai Verna EX 1.4 VTVT`
- `Hyundai Verna Fluidic 1.4 VTVT`
- `Hyundai Verna Fluidic 1.6 CRDi`
- `Hyundai Verna Fluidic 1.6 CRDi SX`
- `Hyundai Verna Fluidic 1.6 CRDi SX Opt`
- `Hyundai Verna Fluidic 1.6 CRDi SX Opt AT`
- `Hyundai Verna Fluidic 1.6 VTVT SX`
- `Hyundai Verna Fluidic 1.6 VTVT SX Opt AT`
- `Hyundai Verna SX (O) 1.6 CRDi AT`
- `Hyundai Verna SX Plus 1.6 VTVT AT`
- `Hyundai Verna VGT CRDi SX ABS`
- `Hyundai Verna Xi`
- `Hyundai Xcent S 1.1 CRDi`
- `Hyundai Xcent S 1.1 CRDi Special Edition`
- `Hyundai Xcent S 1.2`
- `Hyundai Xcent S AT 1.2`
- `Hyundai Xcent S AT 1.2 (O)`
- `Hyundai Xcent SX 1.2 (O)`
- `i10`
- `i20`
- `Ignis`
- `Indica`
- `Innova`
- `Isuzu MU-X 4x4`
- `Jaguar F-Pace Prestige`
- `Jaguar F-Pace Prestige [2016-2017]`
- `Jaguar XE Portfolio Diesel`
- `Jaguar XE Prestige`
- `Jaguar XE Prestige Diesel`
- `Jaguar XF 2.2 Diesel`
- `Jaguar XF 2.2 Diesel Luxury`
- `Jaguar XF 3.0 V6 Premium Luxury`
- `Jaguar XF Petrol 2.0`
- `Jaguar XF Portfolio Diesel`
- `Jaguar XJ L 3.0 Portfolio`
- `Jaguar XJ L 5.0 Petrol SC Supersport`
- `Jazz`
- `Jeep`
- `Jeep Compass Limited (O) 1.4 Petrol AT [2017-2020]`
- `Jeep Compass Limited 2.0 Diesel [2017-2020]`
- `Jeep Compass Limited Plus 2.0 Diesel 4x4 AT`
- `Jeep Compass Limited Plus Petrol AT [2018-2020]`
- `Jeep Compass Longitude (O) 2.0 Diesel [2017-2020]`
- `Jeep Compass Trailhawk 2.0 4x4`
- `Jetta`
- `Kia Seltos GTX 1.4 Dual Tone`
- `Kia Seltos GTX Plus 1.4 [2020-2021]`
- `Kia Seltos GTX Plus AT 1.4 [2019-2020]`
- `Kia Seltos GTX Plus AT 1.5 Diesel [2019-2020]`
- `Kia Seltos HTK Plus AT 1.5 Diesel [2020-2021]`
- `Kia Sonet GTX Plus 1.0 iMT [2020-2021]`
- `Kia Sonet GTX Plus 1.5 [2020-2021]`
- `KUV100`
- `Kwid`
- `Lamborghini Gallardo India Ltd Edition LP 550-2`
- `Land`
- `Land Rover Discovery Sport HSE`
- `Land Rover Discovery Sport HSE Luxury 7-Seater`
- `Land Rover Freelander 2 SE`
- `Land Rover Range Rover 3.0 V6 Diesel Vogue`
- `Land Rover Range Rover 4.4 SDV8 Vogue SE`
- `Land Rover Range Rover Evoque Dynamic SD4`
- `Land Rover Range Rover Evoque HSE`
- `Land Rover Range Rover Evoque HSE Dynamic`
- `Land Rover Range Rover Evoque Prestige SD4`
- `Land Rover Range Rover Evoque S [2020-2021]`
- `Land Rover Range Rover Evoque SE Dynamic`
- `Land Rover Range Rover Sport SE 3.0 Diesel [2018-2020]`
- `Laura`
- `Lexus ES 300h`
- `Lexus NX 300h Luxury [2017-2020]`
- `Lodgy`
- `Logan`
- `M-Class`
- `Mahindra Alturas G4 2WD AT [2018-2020]`
- `Mahindra Bolero Power Plus SLE [2016-2019]`
- `Mahindra Bolero SLX BS IV`
- `Mahindra Jeep CJ 500 D`
- `Mahindra KUV100 K6 D 5 STR`
- `Mahindra KUV100 K6 D 5 STR [2016-2017]`
- `Mahindra KUV100 NXT K4 Plus 6 STR [2017-2020]`
- `Mahindra KUV100 NXT K8 D 6 STR`
- `Mahindra Quanto C8`
- `Mahindra Scorpio S11 2WD 7 STR`
- `Mahindra Scorpio S11 2WD 8 STR`
- `Mahindra Scorpio S7 140 2WD 7 STR`
- `Mahindra Scorpio SLE 2.6 CRDe`
- `Mahindra Scorpio SLE BS-III`
- `Mahindra Scorpio VLX 4WD Airbag BS-IV`
- `Mahindra Scorpio VLX Special Edition BS-IV`
- `Mahindra Thar CRDe 4x4 AC`
- `Mahindra Thar CRDe 4x4 AC1`
- `Mahindra Thar DI 4WD PS BS III`
- `Mahindra Thar LX 4-STR Convertible Petrol AT`
- `Mahindra Thar LX 4-STR Hard Top Diesel MT`
- `Mahindra Thar LX 4-STR Hard Top Petrol AT`
- `Mahindra TUV300 T6 Plus`
- `Mahindra TUV300 T8`
- `Mahindra TUV300 T8 AMT mHAWK100`
- `Mahindra Verito 1.5 D4 BS-IV`
- `Mahindra XUV300 1.2 W6 [2019-2019]`
- `Mahindra XUV300 1.5 W8 (O) [2019-2020]`
- `Mahindra XUV300 1.5 W8 (O) AMT [2019-2020]`
- `Mahindra XUV500 W10`
- `Mahindra XUV500 W10 AT`
- `Mahindra XUV500 W10 AT 1.99`
- `Mahindra XUV500 W10 AT Black Interiors [2017]`
- `Mahindra XUV500 W10 AWD`
- `Mahindra XUV500 W10 AWD AT`
- `Mahindra XUV500 W11`
- `Mahindra XUV500 W11 AT`
- `Mahindra XUV500 W11(O) [2018-2020]`
- `Mahindra XUV500 W5 [2018-2020]`
- `Mahindra XUV500 W6`
- `Mahindra XUV500 W6 AT 1.99`
- `Mahindra XUV500 W7 [2018-2020]`
- `Mahindra XUV500 W8`
- `Mahindra XUV500 W8 [2015-2017]`
- `Mahindra XUV500 W8 AWD`
- `Mahindra XUV500 W9 1.99`
- `Mahindra XUV500 W9 [2018-2020]`
- `Mahindra-Renault Logan DLE 1.5 dci`
- `Maruti Suzuki A-Star Vxi`
- `Maruti Suzuki Alto 800 Lxi`
- `Maruti Suzuki Alto 800 Lxi (Airbag) [2012-2015]`
- `Maruti Suzuki Alto 800 Lxi CNG`
- `Maruti Suzuki Alto 800 Vxi`
- `Maruti Suzuki Alto K10 LXi`
- `Maruti Suzuki Alto K10 VXi`
- `Maruti Suzuki Alto K10 VXi AMT (Airbag) [2014-2019]`
- `Maruti Suzuki Alto K10 VXi AMT [2014-2018]`
- `Maruti Suzuki Alto LXi BS-III`
- `Maruti Suzuki Alto LXi BS-IV`
- `Maruti Suzuki Baleno Alpha 1.2`
- `Maruti Suzuki Baleno Alpha 1.3`
- `Maruti Suzuki Baleno Delta 1.2`
- `Maruti Suzuki Baleno Delta 1.2 AT`
- `Maruti Suzuki Baleno Delta 1.3`
- `Maruti Suzuki Baleno Delta Automatic`
- `Maruti Suzuki Baleno Zeta`
- `Maruti Suzuki Baleno Zeta 1.2`
- `Maruti Suzuki Baleno Zeta 1.2 AT`
- `Maruti Suzuki Baleno Zeta 1.3`
- `Maruti Suzuki Celerio VXi`
- `Maruti Suzuki Celerio VXi [2017-2019]`
- `Maruti Suzuki Celerio VXi AMT`
- `Maruti Suzuki Celerio VXi AMT [2017-2019]`
- `Maruti Suzuki Celerio VXi AMT ABS`
- `Maruti Suzuki Celerio VXi CNG [2019-2020]`
- `Maruti Suzuki Celerio ZXi`
- `Maruti Suzuki Celerio ZXi [2017-2019]`
- `Maruti Suzuki Celerio ZXi AMT [2017-2019]`
- `Maruti Suzuki Celerio ZXi AMT [2019-2020]`
- `Maruti Suzuki Ciaz Alpha 1.3 Hybrid`
- `Maruti Suzuki Ciaz Alpha 1.4 AT`
- `Maruti Suzuki Ciaz Alpha 1.4 MT`
- `Maruti Suzuki Ciaz Delta 1.3 Hybrid`
- `Maruti Suzuki Ciaz Delta Hybrid 1.5 [2018-2020]`
- `Maruti Suzuki Ciaz VDi SHVS`
- `Maruti Suzuki Ciaz VXi (O)`
- `Maruti Suzuki Ciaz ZDi SHVS`
- `Maruti Suzuki Ciaz ZDi+ SHVS RS [2015-2017]`
- `Maruti Suzuki Ciaz Zeta 1.4 AT`
- `Maruti Suzuki Ciaz ZXi`
- `Maruti Suzuki Ciaz ZXi (O) [2014-2015]`
- `Maruti Suzuki Ciaz ZXi AT`
- `Maruti Suzuki Ciaz ZXI+`
- `Maruti Suzuki Dzire VDi`
- `Maruti Suzuki Dzire VXi AMT`
- `Maruti Suzuki Dzire ZDi`
- `Maruti Suzuki Dzire ZDi AMT`
- `Maruti Suzuki Eeco 5 STR WITH A/C+HTR [2019-2020]`
- `Maruti Suzuki Ertiga VDi`
- `Maruti Suzuki Ertiga VDI SHVS`
- `Maruti Suzuki Ertiga VXi`
- `Maruti Suzuki Ertiga VXI CNG`
- `Maruti Suzuki Ertiga ZDi`
- `Maruti Suzuki Ertiga ZDI + SHVS`
- `Maruti Suzuki Ertiga ZDi Plus 1.5 Diesel`
- `Maruti Suzuki Estilo LXi BS-IV`
- `Maruti Suzuki Estilo VXi`
- `Maruti Suzuki Ignis Sigma 1.2 MT`
- `Maruti Suzuki Ignis Zeta 1.2 MT`
- `Maruti Suzuki Ritz Ldi BS-IV`
- `Maruti Suzuki Ritz Vdi BS-IV`
- `Maruti Suzuki Ritz VXI BS-IV`
- `Maruti Suzuki Ritz Zxi BS-IV`
- `Maruti Suzuki S-Cross Alpha 1.6`
- `Maruti Suzuki S-Cross Zeta 1.3`
- `Maruti Suzuki Swift Dzire LDI`
- `Maruti Suzuki Swift Dzire LXI`
- `Maruti Suzuki Swift DZire VDI`
- `Maruti Suzuki Swift Dzire VDI`
- `Maruti Suzuki Swift Dzire VDi BS-IV`
- `Maruti Suzuki Swift DZire VXI`
- `Maruti Suzuki Swift Dzire VXI`
- `Maruti Suzuki Swift Dzire VXI AT ABS`
- `Maruti Suzuki Swift Dzire ZDI AMT`
- `Maruti Suzuki Swift Dzire ZXI`
- `Maruti Suzuki Swift LDi`
- `Maruti Suzuki Swift LXi`
- `Maruti Suzuki Swift VDi`
- `Maruti Suzuki Swift VDi [2014-2017]`
- `Maruti Suzuki Swift VDi ABS [2014-2017]`
- `Maruti Suzuki Swift VDi BS-IV`
- `Maruti Suzuki Swift VXi`
- `Maruti Suzuki Swift VXi [2014-2017]`
- `Maruti Suzuki Swift VXi AMT`
- `Maruti Suzuki Swift VXi AMT [2018-2019]`
- `Maruti Suzuki Swift ZDi`
- `Maruti Suzuki Swift ZXi`
- `Maruti Suzuki Swift ZXi 1.2 BS-IV`
- `Maruti Suzuki SX4 VDI`
- `Maruti Suzuki SX4 VXi`
- `Maruti Suzuki SX4 ZXi`
- `Maruti Suzuki Vitara Brezza LDi`
- `Maruti Suzuki Vitara Brezza LDi (O) [2016-2018]`
- `Maruti Suzuki Vitara Brezza VDi`
- `Maruti Suzuki Vitara Brezza VDi (O) [2016-2018]`
- `Maruti Suzuki Vitara Brezza VXi`
- `Maruti Suzuki Vitara Brezza ZDi`
- `Maruti Suzuki Vitara Brezza ZDi Plus`
- `Maruti Suzuki Vitara Brezza ZDi Plus Dual Tone AGS`
- `Maruti Suzuki Vitara Brezza ZDi+ Dual Tone [2017-2018]`
- `Maruti Suzuki Wagon R 1.0 LXi`
- `Maruti Suzuki Wagon R 1.0 LXI`
- `Maruti Suzuki Wagon R 1.0 LXi CNG`
- `Maruti Suzuki Wagon R 1.0 VXI`
- `Maruti Suzuki Wagon R 1.0 VXi`
- `Maruti Suzuki Wagon R 1.0 VXI AMT`
- `Maruti Suzuki Wagon R 1.0 VXI+ (O)`
- `Maruti Suzuki Wagon R LXi Minor`
- `Maruti Suzuki Wagon R VXi Minor`
- `Maruti Suzuki XL6 Alpha AT Petrol`
- `Mercedes-Benz A-Class A 180 CDI Style`
- `Mercedes-Benz B-Class B180`
- `Mercedes-Benz C-Class 200 K AT`
- `Mercedes-Benz C-Class 220 CDI AT`
- `Mercedes-Benz C-Class 220 CDI Sport`
- `Mercedes-Benz C-Class 250 CDI`
- `Mercedes-Benz C-Class 250 CDI Elegance`
- `Mercedes-Benz C-Class C 200 Avantgarde`
- `Mercedes-Benz C-Class C 220 CDI Avantgarde`
- `Mercedes-Benz C-Class C 220d Progressive [2018-2019]`
- `Mercedes-Benz C-Class C 250 CDI BlueEFFICIENCY`
- `Mercedes-Benz CLA 200 CDI Sport`
- `Mercedes-Benz CLA 200 CDI Sport (CBU)`
- `Mercedes-Benz CLA 200 D Urban Sport`
- `Mercedes-Benz CLA 200 Petrol Sport`
- `Mercedes-Benz CLA 200 Petrol Sport (CBU)`
- `Mercedes-Benz CLA 45 AMG 4MATIC [2017-2017]`
- `Mercedes-Benz CLS 250 CDI`
- `Mercedes-Benz E-Class 220 CDI AT`
- `Mercedes-Benz E-Class E 200`
- `Mercedes-Benz E-Class E 220 d Avantgarde`
- `Mercedes-Benz E-Class E 220d Exclusive [2019-2019]`
- `Mercedes-Benz E-Class E 220d Expression [2019-2019]`
- `Mercedes-Benz E-Class E 250 CDI Avantgarde`
- `Mercedes-Benz E-Class E 250 CDI Edition E`
- `Mercedes-Benz E-Class E 350 d Exclusive [2017-2019]`
- `Mercedes-Benz E-Class E200`
- `Mercedes-Benz E-Class E200 CGI Blue Efficiency`
- `Mercedes-Benz E-Class E220 CDI Blue Efficiency`
- `Mercedes-Benz E-Class E250 CDI Avantgarde`
- `Mercedes-Benz E-Class E250 Elegance`
- `Mercedes-Benz E-Class E350`
- `Mercedes-Benz E-Class E350 Cabriolet`
- `Mercedes-Benz E-Class E350 CDI Avantgarde`
- `Mercedes-Benz G-Class G 63 AMG`
- `Mercedes-Benz GL 350 CDI`
- `Mercedes-Benz GL 350 CDI BlueEFFICIENCY`
- `Mercedes-Benz GLA 200 CDI Sport`
- `Mercedes-Benz GLA 200 Sport`
- `Mercedes-Benz GLA 220 d 4MATIC`
- `Mercedes-Benz GLC 220 d Progressive`
- `Mercedes-Benz GLC 220 d Sport`
- `Mercedes-Benz GLC 220d 4MATIC Progressive [2019-2021]`
- `Mercedes-Benz GLE 250 d`
- `Mercedes-Benz GLE Coupe 43 4MATIC [2017-2019]`
- `Mercedes-Benz GLS 350 d`
- `Mercedes-Benz M-Class 320 CDI`
- `Mercedes-Benz M-Class 350`
- `Mercedes-Benz M-Class 350 CDI`
- `Mercedes-Benz M-Class ML 350 CDI`
- `Mercedes-Benz S-Class (W222) S 350D [2018-2020]`
- `Mercedes-Benz S-Class 320 CDI`
- `Mercedes-Benz S-Class 350`
- `Mercedes-Benz S-Class 350 CDI L`
- `Mercedes-Benz S-Class S 350 CDI`
- `Mercedes-Benz S-Class S 400`
- `Mercedes-Benz S-Class S 63 AMG`
- `Mercedes-Benz SLK 350`
- `MG Hector Plus Sharp 1.5 DCT Petrol`
- `MG Hector Sharp 1.5 DCT Petrol [2019-2020]`
- `MG Hector Sharp 2.0 Diesel [2019-2020]`
- `MG Hector Super Hybrid 1.5 Petrol [2019-2020]`
- `Micra`
- `MINI Cooper 1.6`
- `MINI Cooper Countryman Cooper D`
- `MINI Cooper Countryman one`
- `MINI Cooper S`
- `MINI Countryman Cooper D`
- `MINI Countryman Cooper S [2020-2021]`
- `Mitsubishi Outlander 2.4 MIVEC`
- `Mitsubishi Pajero Sport 2.5 AT`
- `model_name`
- `MU-X`
- `Mustang`
- `Nano`
- `Nexon`
- `Nissan Micra Active XL`
- `Nissan Micra Active XV`
- `Nissan Micra XE Petrol`
- `Nissan Micra XV CVT [2016-2017]`
- `Nissan Sunny XL`
- `Nissan Sunny XV CVT`
- `Nissan Sunny XV Diesel`
- `Nissan Terrano XL (P)`
- `NX`
- `Octavia`
- `Outlander`
- `Pajero`
- `Passat`
- `Polo`
- `Porsche 718 Cayman [2017-2020]`
- `Porsche Cayenne Diesel`
- `Porsche Cayenne Platinum Edition Diesel`
- `Porsche Cayenne S`
- `Porsche Cayenne S V8 Tiptronic`
- `Pulse`
- `Q3`
- `Q5`
- `Q7`
- `Qualis`
- `Quanto`
- `Rapid`
- `redi-GO`
- `Renault Captur RXT Diesel Dual Tone`
- `Renault Duster 110 PS RxL Diesel`
- `Renault Duster 110 PS RXZ 4X2 AMT Diesel`
- `Renault Duster 110 PS RXZ 4X2 MT Diesel`
- `Renault Duster 110 PS RXZ 4X4 MT Diesel`
- `Renault Duster 110 PS RxZ AWD`
- `Renault Duster 110 PS RxZ AWD Diesel`
- `Renault Duster 110 PS RxZ Diesel`
- `Renault Duster 85 PS RxE`
- `Renault Duster 85 PS RxL Diesel`
- `Renault Duster 85 PS RXS 4X2 MT Diesel`
- `Renault Duster RXL Petrol`
- `Renault Duster RXS CVT`
- `Renault Kwid 1.0 RXL AMT [2017-2019]`
- `Renault Kwid 1.0 RXT AMT Opt [2016-2019]`
- `Renault Kwid 1.0 RXT Opt [2016-2019]`
- `Renault Kwid CLIMBER 1.0 [2017-2019]`
- `Renault Kwid RXT [2015-2019]`
- `Renault Lodgy 110 PS RxL [2015-2016]`
- `Renault Lodgy 110 PS RXZ [2015-2016]`
- `Renault Lodgy 85 PS RXZ [2015-2016]`
- `Renault Pulse RxL Petrol [2015-2017]`
- `Renault Pulse RxZ Airbags`
- `Renault Triber RXZ [2019-2020]`
- `Ritz`
- `S-Class`
- `S-Cross`
- `S60`
- `S90`
- `Safari`
- `Santro`
- `Scorpio`
- `Seltos`
- `Skoda Fabia Elegance 1.2 MPI`
- `Skoda Laura Ambiente 1.9 TDI AT`
- `Skoda Laura Ambition 1.8 TSI`
- `Skoda Octavia 2.0 TDI CR Ambition Plus AT`
- `Skoda Octavia 2.0 TDI CR Style Plus AT [2017]`
- `Skoda Octavia 2.0 TDI L&K`
- `Skoda Rapid 1.5 TDI CR Ambition with Alloy Wheels`
- `Skoda Rapid 1.5 TDI CR Elegance AT`
- `Skoda Rapid 1.5 TDI CR Style Plus AT`
- `Skoda Rapid 1.6 MPI Ambition with Alloy Wheels`
- `Skoda Rapid Active 1.6 MPI MT`
- `Skoda Rapid Ambition 1.5 TDI`
- `Skoda Rapid Ambition 1.5 TDI AT`
- `Skoda Rapid Ambition 1.6 MPI MT`
- `Skoda Rapid Ambition 1.6 TDI CR MT`
- `Skoda Rapid Elegance 1.6 TDI CR MT`
- `Skoda Rapid Monte Carlo 1.5 TDI AT`
- `Skoda Rapid Monte Carlo 1.6 MPI AT`
- `Skoda Rapid Monte Carlo 1.6 MPI MT`
- `Skoda Rapid ONYX 1.5 TDI LE`
- `Skoda Rapid Style 1.5 TDI AT`
- `Skoda Rapid Style 1.6 MPI AT`
- `Skoda Superb Elegance 1.8 TSI AT`
- `Skoda Superb Elegance 1.8 TSI MT`
- `Skoda Superb Elegance 2.0 TDI CR AT`
- `Skoda Superb Elegance TSI AT`
- `Skoda Superb L&K TSI AT`
- `Skoda Yeti Ambition 2.0 TDI CR 4x2`
- `Skoda Yeti Ambition 2.0 TDI CR 4x4`
- `Skoda Yeti Elegance 2.0 TDI CR 4x4`
- `SLK`
- `Sonet`
- `Sport`
- `Sunny`
- `Superb`
- `Swift`
- `SX4`
- `Tata Altroz XZ (O) Petrol`
- `Tata Aria Pure 4x2`
- `Tata Harrier XZ [2019-2020]`
- `Tata Hexa XT 4x2 7 STR`
- `Tata Hexa XT 4x4 7 STR`
- `Tata Hexa XTA 4x2 6 STR`
- `Tata Hexa XTA 4x2 7 STR`
- `Tata Indica Vista Aura + Quadrajet BS-III`
- `Tata Indica Vista LX TDI BS-III`
- `Tata Nano Base`
- `Tata Nano LX`
- `Tata Nano Twist XT`
- `Tata Nexon KRAZ Plus AMT Diesel`
- `Tata Nexon XM`
- `Tata Nexon XM Diesel`
- `Tata Nexon XZ Plus Diesel`
- `Tata Nexon XZ Plus Diesel Dual Tone`
- `Tata Safari Storme 2.2 VX 4x2`
- `Tata Safari Storme 2019 2.2 VX 4x2 Varicor400`
- `Tata Safari XZA Plus`
- `Tata Tiago Revotron XZ`
- `Tata Tiago Revotron XZA [2017-2019]`
- `Tata Tigor Revotron XZA`
- `Tata Zest XMA Diesel`
- `Tata Zest XT Petrol`
- `Terrano`
- `Thar`
- `Tiago`
- `Tigor`
- `Tiguan`
- `Toyota Camry ACV30R`
- `Toyota Camry Hybrid`
- `Toyota Corolla Altis 1.8 G`
- `Toyota Corolla Altis 1.8 VL AT`
- `Toyota Corolla Altis G Diesel`
- `Toyota Corolla Altis GL Petrol`
- `Toyota Corolla Altis JS Petrol`
- `Toyota Corolla Altis VL AT Petrol`
- `Toyota Corolla H2 1.8E`
- `Toyota Etios Cross 1.2 G`
- `Toyota Etios G`
- `Toyota Etios GD`
- `Toyota Etios Liva G SP*`
- `Toyota Etios Liva GD`
- `Toyota Etios Liva V`
- `Toyota Etios Liva VXD`
- `Toyota Etios VX-D`
- `Toyota Fortuner 2.5 Sportivo 4x2 MT`
- `Toyota Fortuner 2.7 4x2 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x2 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x2 MT [2016-2020]`
- `Toyota Fortuner 2.8 4x4 AT [2016-2020]`
- `Toyota Fortuner 2.8 4x4 MT [2016-2020]`
- `Toyota Fortuner 3.0 4x2 MT`
- `Toyota Fortuner 3.0 MT`
- `Toyota Glanza V`
- `Toyota Innova 2.5 E 7 STR`
- `Toyota Innova 2.5 E 8 STR`
- `Toyota Innova 2.5 EV PS 7 STR BS-IV`
- `Toyota Innova 2.5 G 7 STR BS-IV`
- `Toyota Innova 2.5 G BS IV 7 STR`
- `Toyota Innova 2.5 G4 7 STR`
- `Toyota Innova 2.5 G4 8 STR`
- `Toyota Innova 2.5 GX BS III 8 STR`
- `Toyota Innova 2.5 V 7 STR`
- `Toyota Innova 2.5 V 8 STR`
- `Toyota Innova 2.5 VX 7 STR BS-III`
- `Toyota Innova 2.5 VX 8 STR BS-III`
- `Toyota Innova 2.5 VX 8 STR BS-IV`
- `Toyota Innova 2.5 VX BS IV 7 STR`
- `Toyota Innova Crysta 2.4 G 7 STR [2016-2017]`
- `Toyota Innova Crysta 2.4 VX 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 VX 8 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 ZX 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.4 ZX AT 7 STR`
- `Toyota Innova Crysta 2.7 GX AT 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.7 ZX AT 7 STR`
- `Toyota Innova Crysta 2.8 GX AT 7 STR [2016-2020]`
- `Toyota Innova Crysta 2.8 GX AT 8 STR [2016-2020]`
- `Toyota Innova Crysta 2.8 ZX AT 7 STR [2016-2020]`
- `Toyota Land Cruiser LC 200 VX`
- `Toyota Qualis GS G1`
- `Toyota Yaris J CVT [2018-2020]`
- `Triber`
- `Tucson`
- `TUV300`
- `V40`
- `Vento`
- `Venue`
- `Verito`
- `Verna`
- `Vitara`
- `Volkswagen Ameo Comfortline 1.2L (P)`
- `Volkswagen Ameo Highline1.5L (D) [2016-2018]`
- `Volkswagen Ameo Trendline 1.2L (P)`
- `Volkswagen Cross Polo 1.2 TDI`
- `Volkswagen Cross Polo 1.5 TDI`
- `Volkswagen Jetta Comfortline TDI`
- `Volkswagen Jetta Highline TDI`
- `Volkswagen Jetta Highline TDI AT`
- `Volkswagen Passat Highline`
- `Volkswagen Passat Highline DSG`
- `Volkswagen Polo Comfortline 1.2L (D)`
- `Volkswagen Polo Comfortline 1.2L (P)`
- `Volkswagen Polo Comfortline 1.5L (D)`
- `Volkswagen Polo GT TDI`
- `Volkswagen Polo GT TSI`
- `Volkswagen Polo Highline Plus 1.2( P)16 Alloy [2017-2018]`
- `Volkswagen Polo Highline1.0L (P)`
- `Volkswagen Polo Highline1.2L (D)`
- `Volkswagen Polo Highline1.2L (P)`
- `Volkswagen Polo Highline1.5L (D)`
- `Volkswagen Polo Trendline 1.2L (P)`
- `Volkswagen Tiguan - 2020 Highline TDI`
- `Volkswagen Vento Comfortline Diesel`
- `Volkswagen Vento Comfortline Petrol AT`
- `Volkswagen Vento Highline Diesel`
- `Volkswagen Vento Highline Diesel AT [2015-2016]`
- `Volkswagen Vento Highline Petrol`
- `Volkswagen Vento Highline Petrol AT`
- `Volkswagen Vento Highline Plus 1.2 (P) AT 16 Alloy`
- `Volkswagen Vento Highline Plus 1.5 (D) 16 Alloy`
- `Volkswagen Vento Highline Plus 1.5 AT (D) 16 Alloy`
- `Volkswagen Vento Trendline Diesel`
- `Volkswagen Vento TSI`
- `Volvo S60 Kinetic D4`
- `Volvo S60 Polestar [2017-2020]`
- `Volvo S60 Summum D5`
- `Volvo S90 Inscription D4 [2016-2020]`
- `Volvo V40 D3 R-Design`
- `Volvo XC60 D5 AWD AT`
- `Volvo XC60 Inscription [2017-2020]`
- `Volvo XC90 D5 AWD`
- `Wagon`
- `WR-V`
- `X1`
- `X3`
- `X4`
- `X5`
- `X7`
- `XC60`
- `XC90`
- `Xcent`
- `XE`
- `XF`
- `XJ`
- `XL6`
- `XUV300`
- `XUV500`
- `Yaris`
- `Yeti`
- `Z4`
- `Zest`

</details>

<details><summary><code>model_name</code>: 573 unique non-missing value(s)</summary>

- `1000000`
- `1015000`
- `1025000`
- `1030000`
- `1035000`
- `1045000`
- `1050000`
- `1051000`
- `1075000`
- `1085000`
- `1090000`
- `1095000`
- `110000`
- `1100000`
- `11000000`
- `1115000`
- `1125000`
- `1135000`
- `1145000`
- `1149000`
- `115000`
- `1150000`
- `11500000`
- `1165000`
- `1175000`
- `1185000`
- `1190000`
- `1195000`
- `1200000`
- `12100000`
- `1220000`
- `1230000`
- `12300000`
- `1245000`
- `125000`
- `1250000`
- `12500000`
- `1260000`
- `1275000`
- `1285000`
- `1290000`
- `1295000`
- `1299000`
- `1300000`
- `13000000`
- `1325000`
- `1330000`
- `1345000`
- `135000`
- `1350000`
- `1375000`
- `1380000`
- `1385000`
- `1390000`
- `1395000`
- `1399000`
- `140000`
- `1400000`
- `14000000`
- `1425000`
- `1435000`
- `1445000`
- `145000`
- `1450000`
- `14500000`
- `1451000`
- `1455000`
- `1465000`
- `1470000`
- `14700000`
- `1475000`
- `1485000`
- `150000`
- `1500000`
- `1525000`
- `1530000`
- `1545000`
- `1550000`
- `1571000`
- `1575000`
- `1590000`
- `1599000`
- `1600000`
- `1625000`
- `1640000`
- `1645000`
- `165000`
- `1650000`
- `1651000`
- `1675000`
- `1685000`
- `1690000`
- `1699000`
- `170000`
- `1700000`
- `171000`
- `1725000`
- `175000`
- `1750000`
- `1760000`
- `1775000`
- `1785000`
- `1795000`
- `180000`
- `1800000`
- `1811000`
- `1825000`
- `185000`
- `1850000`
- `1851000`
- `1875000`
- `1890000`
- `1895000`
- `190000`
- `1900000`
- `1925000`
- `1930000`
- `195000`
- `1950000`
- `197000`
- `1975000`
- `1990000`
- `1999000`
- `2000000`
- `2025000`
- `2050000`
- `2090000`
- `2095000`
- `210000`
- `2100000`
- `2125000`
- `215000`
- `2150000`
- `2175000`
- `2190000`
- `2195000`
- `2199000`
- `220000`
- `2200000`
- `2225000`
- `225000`
- `2250000`
- `2280000`
- `2290000`
- `2300000`
- `2325000`
- `2330000`
- `235000`
- `2350000`
- `2390000`
- `240000`
- `2400000`
- `245000`
- `2450000`
- `250000`
- `2500000`
- `255000`
- `2550000`
- `2575000`
- `260000`
- `2600000`
- `265000`
- `2650000`
- `2675000`
- `2685000`
- `270000`
- `2700000`
- `2740000`
- `275000`
- `2750000`
- `2775000`
- `2790000`
- `2795000`
- `280000`
- `2800000`
- `285000`
- `2850000`
- `290000`
- `2900000`
- `295000`
- `2950000`
- `2975000`
- `299000`
- `2990000`
- `3`
- `300000`
- `3000000`
- `3075000`
- `310000`
- `3100000`
- `315000`
- `320000`
- `3200000`
- `325000`
- `330000`
- `3300000`
- `335000`
- `3390000`
- `340000`
- `3400000`
- `3445000`
- `345000`
- `349000`
- `3490000`
- `3495000`
- `3499000`
- `350000`
- `3500000`
- `355000`
- `3550000`
- `360000`
- `3600000`
- `365000`
- `370000`
- `3700000`
- `375000`
- `3750000`
- `3785000`
- `3790000`
- `380000`
- `3800000`
- `385000`
- `3850000`
- `390000`
- `3900000`
- `395000`
- `3950000`
- `397000`
- `3975000`
- `399000`
- `4.4`
- `400000`
- `4000000`
- `405000`
- `410000`
- `4100000`
- `415000`
- `418000`
- `4190000`
- `4195000`
- `420000`
- `4200000`
- `425000`
- `4250000`
- `429000`
- `430000`
- `4300000`
- `435000`
- `4350000`
- `440000`
- `4400000`
- `445000`
- `449000`
- `450000`
- `4500000`
- `455000`
- `4550000`
- `460000`
- `4600000`
- `465000`
- `470000`
- `4700000`
- `475000`
- `4750000`
- `480000`
- `4800000`
- `481000`
- `485000`
- `4850000`
- `489000`
- `490000`
- `4900000`
- `495000`
- `4975000`
- `499000`
- `5`
- `500000`
- `505000`
- `510000`
- `5100000`
- `515000`
- `5175000`
- `5190000`
- `520000`
- `5200000`
- `521000`
- `525000`
- `528000`
- `529000`
- `530000`
- `5300000`
- `535000`
- `540000`
- `5400000`
- `545000`
- `550000`
- `5500000`
- `5550000`
- `560000`
- `5600000`
- `565000`
- `5650000`
- `567000`
- `5675000`
- `569000`
- `570000`
- `5700000`
- `575000`
- `580000`
- `5800000`
- `585000`
- `5850000`
- `590000`
- `5900000`
- `595000`
- `598000`
- `599000`
- `6`
- `600000`
- `610000`
- `615000`
- `620000`
- `621000`
- `62500`
- `625000`
- `630000`
- `635000`
- `640000`
- `645000`
- `65000`
- `650000`
- `6500000`
- `655000`
- `660000`
- `6600000`
- `670000`
- `6700000`
- `675000`
- `680000`
- `6800000`
- `685000`
- `6850000`
- `690000`
- `695000`
- `6950000`
- `699000`
- `7`
- `700000`
- `710000`
- `7100000`
- `718`
- `720000`
- `7200000`
- `725000`
- `730000`
- `7300000`
- `735000`
- `740000`
- `745000`
- `749000`
- `750000`
- `7500000`
- `755000`
- `7600000`
- `765000`
- `769000`
- `770000`
- `775000`
- `780000`
- `7800000`
- `785000`
- `790000`
- `795000`
- `80000`
- `800000`
- `810000`
- `815000`
- `820000`
- `825000`
- `835000`
- `8400000`
- `850000`
- `8500000`
- `855000`
- `860000`
- `8600000`
- `870000`
- `875000`
- `880000`
- `890000`
- `891000`
- `895000`
- `900000`
- `910000`
- `915000`
- `925000`
- `930000`
- `935000`
- `945000`
- `949000`
- `95000`
- `950000`
- `9500000`
- `960000`
- `975000`
- `980000`
- `985000`
- `990000`
- `995000`
- `999000`
- `A-Class`
- `A-Star`
- `A3`
- `A4`
- `A6`
- `A8`
- `Abarth`
- `Accord`
- `Alto`
- `Altroz`
- `Alturas`
- `Amaze`
- `Ameo`
- `Aria`
- `Aspire`
- `Avventura`
- `B-Class`
- `Baleno`
- `Beat`
- `Bolero`
- `BR-V`
- `Brio`
- `C-Class`
- `Camry`
- `Captur`
- `Cayenne`
- `Celerio`
- `Ciaz`
- `City`
- `Civic`
- `CLA`
- `CLS`
- `Compass`
- `Continental`
- `Cooper`
- `Corolla`
- `Countryman`
- `CR-V`
- `Creta`
- `Cross`
- `Cruze`
- `Discovery`
- `Duster`
- `Dzire`
- `E-Class`
- `EcoSport`
- `Eeco`
- `Elantra`
- `Elite`
- `Endeavour`
- `Enjoy`
- `Eon`
- `Ertiga`
- `ES`
- `Estilo`
- `Etios`
- `Evoque`
- `F-Pace`
- `Fabia`
- `Fiesta`
- `Figo`
- `Fluidic`
- `Fortuner`
- `Freelander`
- `Freestyle`
- `G-Class`
- `Gallardo`
- `GL`
- `GLA`
- `Glanza`
- `GLC`
- `GLE`
- `GLS`
- `GO`
- `Grand`
- `Harrier`
- `Hector`
- `Hexa`
- `i10`
- `i20`
- `Ignis`
- `Indica`
- `Innova`
- `Jazz`
- `Jeep`
- `Jetta`
- `KUV100`
- `Kwid`
- `Land`
- `Laura`
- `Lodgy`
- `Logan`
- `M-Class`
- `Micra`
- `MU-X`
- `Mustang`
- `Nano`
- `Nexon`
- `NX`
- `Octavia`
- `Outlander`
- `Pajero`
- `Passat`
- `Polo`
- `price`
- `Pulse`
- `Q3`
- `Q5`
- `Q7`
- `Qualis`
- `Quanto`
- `Rapid`
- `redi-GO`
- `Ritz`
- `S-Class`
- `S-Cross`
- `S60`
- `S90`
- `Safari`
- `Santro`
- `Scorpio`
- `Seltos`
- `SLK`
- `Sonet`
- `Sport`
- `Sunny`
- `Superb`
- `Swift`
- `SX4`
- `Terrano`
- `Thar`
- `Tiago`
- `Tigor`
- `Tiguan`
- `Triber`
- `Tucson`
- `TUV300`
- `V40`
- `Vento`
- `Venue`
- `Verito`
- `Verna`
- `Vitara`
- `Wagon`
- `WR-V`
- `X1`
- `X3`
- `X4`
- `X5`
- `X7`
- `XC60`
- `XC90`
- `Xcent`
- `XE`
- `XF`
- `XJ`
- `XL6`
- `XUV300`
- `XUV500`
- `Yaris`
- `Yeti`
- `Z4`
- `Zest`

</details>

<details><summary><code>fuel_type</code>: 21 unique non-missing value(s)</summary>

- `Agra`
- `Bangalore`
- `Chennai`
- `city`
- `CNG + 1`
- `Dehradun`
- `Delhi`
- `Diesel`
- `Faridabad`
- `Ghaziabad`
- `Hybrid`
- `Hyderabad`
- `Lucknow`
- `Mumbai`
- `Navi Mumbai`
- `Noida`
- `Panchkula`
- `Petrol`
- `Petrol + 1`
- `Pune`
- `Thane`

</details>

<details><summary><code>city</code>: 15 unique non-missing value(s)</summary>

- `Agra`
- `Bangalore`
- `Chennai`
- `Dehradun`
- `Delhi`
- `Faridabad`
- `Ghaziabad`
- `Hyderabad`
- `Lucknow`
- `Mumbai`
- `Navi Mumbai`
- `Noida`
- `Panchkula`
- `Pune`
- `Thane`

</details>

### Possible invalid or inconsistent values

- `year` has 3458 non-empty value(s) that do not parse as numbers (examples: `brand`, `Renault`, `Hyundai`, `Honda`, `Skoda`, `Maruti Suzuki`, `BMW`, `Mahindra`).
- `price` has 8 non-empty value(s) that do not parse as numbers (examples: `distance_travelled(kms)`).
- `distance_travelled(kms)` has 3458 non-empty value(s) that do not parse as numbers (examples: `fuel_type`, `Diesel`, `Petrol`, `Hybrid`, `Petrol + 1`, `CNG + 1`).
- `inv_car_age` contains 21 infinite numeric value(s).
- 8 row(s) contain at least three values matching column names and may be repeated embedded headers (examples: data row 1726 (`UsedCars_Banglore.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 1974 (`UsedCars_Chennai.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 2221 (`UsedCars_Combined.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 3947 (`UsedCars_Delhi.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 4194 (`UsedCars_Hyderabad.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 4440 (`UsedCars_Kolkata.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 4688 (`UsedCars_Mumbai.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`); data row 4936 (`UsedCars_Pune.csv`; `Id=year`, `year=brand`, `brand=full_model_name`, `full_model_name=model_name`, `model_name=price`)). Review before treating them as vehicle records.
- Source.Name groups have 2 different populated-column patterns. A single shared row schema may be misaligned (examples: `Dataset.csv`: `Source_Row_Index`, `Id`, `year`, `brand`, `full_model_name`, `model_name`, `price`, `distance_travelled(kms)`, `fuel_type`, `city`, `brand_rank`, `car_age`, `distance below 30k km`, `new and less used`, `inv_car_price`, `inv_car_dist`, `inv_car_age`, `inv_brand`, `std_invprice`, `std_invdistance_travelled`, `std_invrank`, `best_buy1`, `best_buy2`; `UsedCars_Banglore.csv`: `Source_Row_Index`, `Id`, `year`, `brand`, `full_model_name`, `model_name`, `price`, `distance_travelled(kms)`, `fuel_type`).

### Source file groups and populated-column coverage

The `Source.Name` values identify source-file groups within this combined CSV. Different populated-column patterns are evidence that one global header may not describe every source group.

| Source.Name | Rows | Populated fields (non-missing counts) |
| --- | --- | --- |
| Dataset.csv | 1,725 | `Source_Row_Index` (1,725), `Id` (1,725), `year` (1,725), `brand` (1,725), `full_model_name` (1,725), `model_name` (1,725), `price` (1,725), `distance_travelled(kms)` (1,725), `fuel_type` (1,725), `city` (1,725), `brand_rank` (1,725), `car_age` (1,725), `distance below 30k km` (1,725), `new and less used` (1,725), `inv_car_price` (1,725), `inv_car_dist` (1,725), `inv_car_age` (1,725), `inv_brand` (1,725), `std_invprice` (1,725), `std_invdistance_travelled` (1,725), `std_invrank` (1,725), `best_buy1` (1,725), `best_buy2` (1,725) |
| UsedCars_Banglore.csv | 248 | `Source_Row_Index` (247), `Id` (248), `year` (248), `brand` (248), `full_model_name` (248), `model_name` (248), `price` (248), `distance_travelled(kms)` (248), `fuel_type` (248) |
| UsedCars_Chennai.csv | 247 | `Source_Row_Index` (246), `Id` (247), `year` (247), `brand` (247), `full_model_name` (247), `model_name` (247), `price` (247), `distance_travelled(kms)` (247), `fuel_type` (247) |
| UsedCars_Combined.csv | 1,726 | `Source_Row_Index` (1,725), `Id` (1,726), `year` (1,726), `brand` (1,726), `full_model_name` (1,726), `model_name` (1,726), `price` (1,726), `distance_travelled(kms)` (1,726), `fuel_type` (1,726) |
| UsedCars_Delhi.csv | 247 | `Source_Row_Index` (246), `Id` (247), `year` (247), `brand` (247), `full_model_name` (247), `model_name` (247), `price` (247), `distance_travelled(kms)` (247), `fuel_type` (247) |
| UsedCars_Hyderabad.csv | 246 | `Source_Row_Index` (245), `Id` (246), `year` (246), `brand` (246), `full_model_name` (246), `model_name` (246), `price` (246), `distance_travelled(kms)` (246), `fuel_type` (246) |
| UsedCars_Kolkata.csv | 248 | `Source_Row_Index` (247), `Id` (248), `year` (248), `brand` (248), `full_model_name` (248), `model_name` (248), `price` (248), `distance_travelled(kms)` (248), `fuel_type` (248) |
| UsedCars_Mumbai.csv | 248 | `Source_Row_Index` (247), `Id` (248), `year` (248), `brand` (248), `full_model_name` (248), `model_name` (248), `price` (248), `distance_travelled(kms)` (248), `fuel_type` (248) |
| UsedCars_Pune.csv | 248 | `Source_Row_Index` (247), `Id` (248), `year` (248), `brand` (248), `full_model_name` (248), `model_name` (248), `price` (248), `distance_travelled(kms)` (248), `fuel_type` (248) |


### Price-field values by Source.Name

These are values parsed from each flattened column under the CSV's top-level header. For groups with different populated-field patterns, they may not represent the named price measure.

| Source.Name | Price field | Finite numeric values | Unparsed non-missing | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Dataset.csv | price | 1,725 | 0 | 62500 | 14700000 | 1494837.391304348 |
| UsedCars_Banglore.csv | price | 247 | 1 | 2750.0 | 202000.0 | 45579.89473684211 |
| UsedCars_Chennai.csv | price | 246 | 1 | 1664.0 | 420000.0 | 53344.756097560974 |
| UsedCars_Combined.csv | price | 1,725 | 1 | 350.0 | 790000.0 | 53848.25623188406 |
| UsedCars_Delhi.csv | price | 246 | 1 | 490.0 | 790000.0 | 45863.5162601626 |
| UsedCars_Hyderabad.csv | price | 245 | 1 | 1600.0 | 550000.0 | 70645.6693877551 |
| UsedCars_Kolkata.csv | price | 247 | 1 | 1664.0 | 420000.0 | 52395.58704453441 |
| UsedCars_Mumbai.csv | price | 247 | 1 | 350.0 | 195000.0 | 47909.61538461538 |
| UsedCars_Pune.csv | price | 247 | 1 | 700.0 | 508881.0 | 61300.4008097166 |

Duplicate counts above compare parsed field values; they are not confirmed duplicate vehicles. Sparse or misaligned source schemas can create repeated blank-heavy rows.
- Identifier-like field `Source_Row_Index` has 5,183 row(s) sharing repeated values (1,725 distinct non-missing values); check its scope and source-file combination before treating it as a key.
- Identifier-like field `Id` has 3,458 row(s) sharing repeated values (1,745 distinct non-missing values); check its scope and source-file combination before treating it as a key.

## combined_cars3.csv

- **Data rows:** 15,411
- **Data columns:** 15
- **CSV header/metadata rows skipped:** 1
- **Pandas version:** 3.1.1
- **Exact full-row duplicates after parsing:** 0
- **Potential same-payload duplicates** (excluding source row index and `Id`, but retaining other fields): 167

### Exact column names and Pandas dtypes

| Column | Pandas dtype | Non-missing | Missing |
| --- | --- | --- | --- |
| Source.Name | str | 15411 | 0 |
| Source_Row_Index | int64 | 15411 | 0 |
| car_name | str | 15411 | 0 |
| brand | str | 15411 | 0 |
| model | str | 15411 | 0 |
| vehicle_age | int64 | 15411 | 0 |
| km_driven | int64 | 15411 | 0 |
| seller_type | str | 15411 | 0 |
| fuel_type | str | 15411 | 0 |
| transmission_type | str | 15411 | 0 |
| mileage | float64 | 15411 | 0 |
| engine | int64 | 15411 | 0 |
| max_power | float64 | 15411 | 0 |
| seats | int64 | 15411 | 0 |
| selling_price | int64 | 15411 | 0 |

### First 10 data records

| Source.Name | Source_Row_Index | car_name | brand | model | vehicle_age | km_driven | seller_type | fuel_type | transmission_type | mileage | engine | max_power | seats | selling_price |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| cardekho_dataset.csv | 0 | Maruti Alto | Maruti | Alto | 9 | 120000 | Individual | Petrol | Manual | 19.7 | 796 | 46.3 | 5 | 120000 |
| cardekho_dataset.csv | 1 | Hyundai Grand | Hyundai | Grand | 5 | 20000 | Individual | Petrol | Manual | 18.9 | 1197 | 82.0 | 5 | 550000 |
| cardekho_dataset.csv | 2 | Hyundai i20 | Hyundai | i20 | 11 | 60000 | Individual | Petrol | Manual | 17.0 | 1197 | 80.0 | 5 | 215000 |
| cardekho_dataset.csv | 3 | Maruti Alto | Maruti | Alto | 9 | 37000 | Individual | Petrol | Manual | 20.92 | 998 | 67.1 | 5 | 226000 |
| cardekho_dataset.csv | 4 | Ford Ecosport | Ford | Ecosport | 6 | 30000 | Dealer | Diesel | Manual | 22.77 | 1498 | 98.59 | 5 | 570000 |
| cardekho_dataset.csv | 5 | Maruti Wagon R | Maruti | Wagon R | 8 | 35000 | Individual | Petrol | Manual | 18.9 | 998 | 67.1 | 5 | 350000 |
| cardekho_dataset.csv | 6 | Hyundai i10 | Hyundai | i10 | 8 | 40000 | Dealer | Petrol | Manual | 20.36 | 1197 | 78.9 | 5 | 315000 |
| cardekho_dataset.csv | 7 | Maruti Wagon R | Maruti | Wagon R | 3 | 17512 | Dealer | Petrol | Manual | 20.51 | 998 | 67.04 | 5 | 410000 |
| cardekho_dataset.csv | 8 | Hyundai Venue | Hyundai | Venue | 2 | 20000 | Individual | Petrol | Automatic | 18.15 | 998 | 118.35 | 5 | 1050000 |
| cardekho_dataset.csv | 12 | Maruti Swift | Maruti | Swift | 4 | 28321 | Dealer | Petrol | Manual | 16.6 | 1197 | 85.0 | 5 | 511000 |

### Numerical summaries

| Column | Parsed numeric | Unparsed | Infinite | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| Source_Row_Index | 15,411 | 0 | 0 | 0 | 19543 | 9811.857699046135 |
| vehicle_age | 15,411 | 0 | 0 | 0 | 29 | 6.0363376808772955 |
| km_driven | 15,411 | 0 | 0 | 100 | 3800000 | 55616.48063071832 |
| mileage | 15,411 | 0 | 0 | 4.0 | 33.54 | 19.701151125819223 |
| engine | 15,411 | 0 | 0 | 793 | 6592 | 1486.0577509571085 |
| max_power | 15,411 | 0 | 0 | 38.4 | 626.0 | 100.5882538446564 |
| seats | 15,411 | 0 | 0 | 0 | 9 | 5.325481798715203 |
| selling_price | 15,411 | 0 | 0 | 40000 | 39500000 | 774971.1164103562 |

Numeric parsing is also attempted for string-typed columns. Averages exclude missing, unparseable, and infinite values. Fields selected by numeric-like names can be mixed; inspect their parse-failure counts.

### Categorical unique values

<details><summary><code>Source.Name</code>: 1 unique non-missing value(s)</summary>

- `cardekho_dataset.csv`

</details>

<details><summary><code>car_name</code>: 121 unique non-missing value(s)</summary>

- `Audi A4`
- `Audi A6`
- `Audi A8`
- `Audi Q7`
- `Bentley Continental`
- `BMW 3`
- `BMW 5`
- `BMW 6`
- `BMW 7`
- `BMW X1`
- `BMW X3`
- `BMW X4`
- `BMW X5`
- `BMW Z4`
- `Datsun GO`
- `Datsun redi-GO`
- `Datsun RediGO`
- `Ferrari GTC4Lusso`
- `Force Gurkha`
- `Ford Aspire`
- `Ford Ecosport`
- `Ford Endeavour`
- `Ford Figo`
- `Ford Freestyle`
- `Honda Amaze`
- `Honda City`
- `Honda Civic`
- `Honda CR`
- `Honda CR-V`
- `Honda Jazz`
- `Honda WR-V`
- `Hyundai Aura`
- `Hyundai Creta`
- `Hyundai Elantra`
- `Hyundai Grand`
- `Hyundai i10`
- `Hyundai i20`
- `Hyundai Santro`
- `Hyundai Tucson`
- `Hyundai Venue`
- `Hyundai Verna`
- `Isuzu D-Max`
- `ISUZU MUX`
- `Isuzu MUX`
- `Jaguar F-PACE`
- `Jaguar XE`
- `Jaguar XF`
- `Jeep Compass`
- `Jeep Wrangler`
- `Kia Carnival`
- `Kia Seltos`
- `Land Rover Rover`
- `Lexus ES`
- `Lexus NX`
- `Lexus RX`
- `Mahindra Alturas`
- `Mahindra Bolero`
- `Mahindra KUV`
- `Mahindra KUV100`
- `Mahindra Marazzo`
- `Mahindra Scorpio`
- `Mahindra Thar`
- `Mahindra XUV300`
- `Mahindra XUV500`
- `Maruti Alto`
- `Maruti Baleno`
- `Maruti Celerio`
- `Maruti Ciaz`
- `Maruti Dzire LXI`
- `Maruti Dzire VXI`
- `Maruti Dzire ZXI`
- `Maruti Eeco`
- `Maruti Ertiga`
- `Maruti Ignis`
- `Maruti S-Presso`
- `Maruti Swift`
- `Maruti Swift Dzire`
- `Maruti Vitara`
- `Maruti Wagon R`
- `Maruti XL6`
- `Maserati Ghibli`
- `Maserati Quattroporte`
- `Mercedes-AMG C`
- `Mercedes-Benz C-Class`
- `Mercedes-Benz CLS`
- `Mercedes-Benz E-Class`
- `Mercedes-Benz GL-Class`
- `Mercedes-Benz GLS`
- `Mercedes-Benz S-Class`
- `MG Hector`
- `Mini Cooper`
- `Nissan Kicks`
- `Nissan X-Trail`
- `Porsche Cayenne`
- `Porsche Macan`
- `Porsche Panamera`
- `Renault Duster`
- `Renault KWID`
- `Renault Triber`
- `Rolls-Royce Ghost`
- `Skoda Octavia`
- `Skoda Rapid`
- `Skoda Superb`
- `Tata Altroz`
- `Tata Harrier`
- `Tata Hexa`
- `Tata Nexon`
- `Tata Safari`
- `Tata Tiago`
- `Tata Tigor`
- `Toyota Camry`
- `Toyota Fortuner`
- `Toyota Glanza`
- `Toyota Innova`
- `Toyota Yaris`
- `Volkswagen Polo`
- `Volkswagen Vento`
- `Volvo S90`
- `Volvo XC`
- `Volvo XC60`
- `Volvo XC90`

</details>

<details><summary><code>brand</code>: 32 unique non-missing value(s)</summary>

- `Audi`
- `Bentley`
- `BMW`
- `Datsun`
- `Ferrari`
- `Force`
- `Ford`
- `Honda`
- `Hyundai`
- `Isuzu`
- `ISUZU`
- `Jaguar`
- `Jeep`
- `Kia`
- `Land Rover`
- `Lexus`
- `Mahindra`
- `Maruti`
- `Maserati`
- `Mercedes-AMG`
- `Mercedes-Benz`
- `MG`
- `Mini`
- `Nissan`
- `Porsche`
- `Renault`
- `Rolls-Royce`
- `Skoda`
- `Tata`
- `Toyota`
- `Volkswagen`
- `Volvo`

</details>

<details><summary><code>model</code>: 120 unique non-missing value(s)</summary>

- `3`
- `5`
- `6`
- `7`
- `A4`
- `A6`
- `A8`
- `Alto`
- `Altroz`
- `Alturas`
- `Amaze`
- `Aspire`
- `Aura`
- `Baleno`
- `Bolero`
- `C`
- `C-Class`
- `Camry`
- `Carnival`
- `Cayenne`
- `Celerio`
- `Ciaz`
- `City`
- `Civic`
- `CLS`
- `Compass`
- `Continental`
- `Cooper`
- `CR`
- `CR-V`
- `Creta`
- `D-Max`
- `Duster`
- `Dzire LXI`
- `Dzire VXI`
- `Dzire ZXI`
- `E-Class`
- `Ecosport`
- `Eeco`
- `Elantra`
- `Endeavour`
- `Ertiga`
- `ES`
- `F-PACE`
- `Figo`
- `Fortuner`
- `Freestyle`
- `Ghibli`
- `Ghost`
- `GL-Class`
- `Glanza`
- `GLS`
- `GO`
- `Grand`
- `GTC4Lusso`
- `Gurkha`
- `Harrier`
- `Hector`
- `Hexa`
- `i10`
- `i20`
- `Ignis`
- `Innova`
- `Jazz`
- `Kicks`
- `KUV`
- `KUV100`
- `KWID`
- `Macan`
- `Marazzo`
- `MUX`
- `Nexon`
- `NX`
- `Octavia`
- `Panamera`
- `Polo`
- `Q7`
- `Quattroporte`
- `Rapid`
- `redi-GO`
- `RediGO`
- `Rover`
- `RX`
- `S-Class`
- `S-Presso`
- `S90`
- `Safari`
- `Santro`
- `Scorpio`
- `Seltos`
- `Superb`
- `Swift`
- `Swift Dzire`
- `Thar`
- `Tiago`
- `Tigor`
- `Triber`
- `Tucson`
- `Vento`
- `Venue`
- `Verna`
- `Vitara`
- `Wagon R`
- `WR-V`
- `Wrangler`
- `X-Trail`
- `X1`
- `X3`
- `X4`
- `X5`
- `XC`
- `XC60`
- `XC90`
- `XE`
- `XF`
- `XL6`
- `XUV300`
- `XUV500`
- `Yaris`
- `Z4`

</details>

<details><summary><code>seller_type</code>: 3 unique non-missing value(s)</summary>

- `Dealer`
- `Individual`
- `Trustmark Dealer`

</details>

<details><summary><code>fuel_type</code>: 5 unique non-missing value(s)</summary>

- `CNG`
- `Diesel`
- `Electric`
- `LPG`
- `Petrol`

</details>

<details><summary><code>transmission_type</code>: 2 unique non-missing value(s)</summary>

- `Automatic`
- `Manual`

</details>

### Possible invalid or inconsistent values

- `seats` contains 2 zero value(s); confirm whether they mean unknown or invalid.

### Source file groups and populated-column coverage

The `Source.Name` values identify source-file groups within this combined CSV. Different populated-column patterns are evidence that one global header may not describe every source group.

| Source.Name | Rows | Populated fields (non-missing counts) |
| --- | --- | --- |
| cardekho_dataset.csv | 15,411 | `Source_Row_Index` (15,411), `car_name` (15,411), `brand` (15,411), `model` (15,411), `vehicle_age` (15,411), `km_driven` (15,411), `seller_type` (15,411), `fuel_type` (15,411), `transmission_type` (15,411), `mileage` (15,411), `engine` (15,411), `max_power` (15,411), `seats` (15,411), `selling_price` (15,411) |


### Price-field values by Source.Name

These are values parsed from each flattened column under the CSV's top-level header. For groups with different populated-field patterns, they may not represent the named price measure.

| Source.Name | Price field | Finite numeric values | Unparsed non-missing | Minimum | Maximum | Average |
| --- | --- | --- | --- | --- | --- | --- |
| cardekho_dataset.csv | selling_price | 15,411 | 0 | 40000 | 39500000 | 774971.1164103562 |

Duplicate counts above compare parsed field values; they are not confirmed duplicate vehicles. Sparse or misaligned source schemas can create repeated blank-heavy rows.


## Cross-dataset comparison

- **Exact common column names:** `Source.Name`
- **Similar concepts with different source column names:**

| Candidate concept | combined_cars.csv | combined_cars2.csv | combined_cars3.csv |
| --- | --- | --- | --- |
| vehicle_model_or_name | `Car_Name` | `full_model_name`, `model_name` | `car_name`, `model` |
| vehicle_brand | — | `brand` | `brand` |
| vehicle_year_or_age | `Year` | `year`, `car_age` | `vehicle_age` |
| price_measures (semantics/units unverified) | `Selling_Price`, `Present_Price` | `price` | `selling_price` |
| distance_km | `Kms_Driven` | `distance_travelled(kms)` | `km_driven` |
| fuel_type | `Fuel_Type` | `fuel_type` | `fuel_type` |
| seller_type | `Seller_Type` | — | `seller_type` |
| transmission | `Transmission` | — | `transmission_type` |
| location | — | `city` | — |

The alias rows are mapping candidates based on column labels, not proof that units or business meanings are equivalent.

### Cross-source type and format differences

**vehicle_model_or_name:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Car_Name | str | text/categorical or mixed |
| combined_cars2.csv | full_model_name | str | text/categorical or mixed |
| combined_cars2.csv | model_name | str | text/categorical or mixed |
| combined_cars3.csv | car_name | str | text/categorical or mixed |
| combined_cars3.csv | model | str | text/categorical or mixed |

**vehicle_brand:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars2.csv | brand | str | text/categorical or mixed |
| combined_cars3.csv | brand | str | text/categorical or mixed |

**vehicle_year_or_age:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Year | float64 | numeric-compatible (100.0% parseable) |
| combined_cars2.csv | year | str | text/categorical or mixed |
| combined_cars2.csv | car_age | float64 | numeric-compatible (100.0% parseable) |
| combined_cars3.csv | vehicle_age | int64 | numeric-compatible (100.0% parseable) |

**price_measures (semantics/units unverified):**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Selling_Price | float64 | numeric-compatible (100.0% parseable) |
| combined_cars.csv | Present_Price | float64 | numeric-compatible (100.0% parseable) |
| combined_cars2.csv | price | str | numeric-compatible (99.8% parseable) |
| combined_cars3.csv | selling_price | int64 | numeric-compatible (100.0% parseable) |

**distance_km:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Kms_Driven | float64 | numeric-compatible (100.0% parseable) |
| combined_cars2.csv | distance_travelled(kms) | str | text/categorical or mixed |
| combined_cars3.csv | km_driven | int64 | numeric-compatible (100.0% parseable) |

**fuel_type:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Fuel_Type | str | text/categorical or mixed |
| combined_cars2.csv | fuel_type | str | text/categorical or mixed |
| combined_cars3.csv | fuel_type | str | text/categorical or mixed |

**seller_type:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Seller_Type | str | text/categorical or mixed |
| combined_cars3.csv | seller_type | str | text/categorical or mixed |

**transmission:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars.csv | Transmission | str | text/categorical or mixed |
| combined_cars3.csv | transmission_type | str | text/categorical or mixed |

**location:**

| Dataset | Column | Pandas dtype | Value profile |
| --- | --- | --- | --- |
| combined_cars2.csv | city | str | text/categorical or mixed |

### Price scale, units, and transaction evidence

| Dataset | Price column | Observed minimum | Observed maximum | Observed average | Interpretation |
| --- | --- | --- | --- | --- | --- |
| combined_cars.csv | Selling_Price | 0.1 | 35.0 | 4.661295681063123 | 0 unparsed; source layout, units, and currency unverified |
| combined_cars.csv | Present_Price | 0.32 | 92.6 | 7.628471760797343 | 0 unparsed; source layout, units, and currency unverified |
| combined_cars2.csv | price | 350.0 | 14700000.0 | 534177.9679227053 | 8 unparsed; source layout, units, and currency unverified |
| combined_cars3.csv | selling_price | 40000 | 39500000 | 774971.1164103562 | 0 unparsed; source layout, units, and currency unverified |

The files expose the following price fields: `Selling_Price` and `Present_Price` in `combined_cars.csv`, `price` in `combined_cars2.csv`, and `selling_price` in `combined_cars3.csv`. Their names, observed ranges, and apparent scales differ; none of the inspected CSV headers declares a currency or unit. For the combined files with multiple populated-column patterns, even a numeric value under a price-named column may belong to a different source field. Preserve each raw price and its source-specific meaning. Do not convert or aggregate prices across sources until authoritative source documentation confirms units and semantics.

No dataset provides an explicit transaction/listing date or a transaction status/identifier sufficient to prove a completed sale. `Selling_Price`/`selling_price` are reported field names, not by themselves evidence that a transaction was confirmed. Treat all three as vehicle records with unverified listing/sale status unless source documentation establishes otherwise. Vehicle `Year`, `car_age`, and `vehicle_age` are not transaction dates.

### Location

Only `combined_cars2.csv` contains a `city` field. It includes missing values. The other datasets contain no observed location column; no location should be imputed from vehicle or source names.
