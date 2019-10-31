<template>
  <q-page padding>

    <!-- <q-card> -->
      <!-- {{ getText() }} -->
      <!-- {{visionData.fullTextAnnotation.pages[0].blocks[0]}} -->

    <!-- </q-card> -->
<!--     <q-uploader
      :metadata="{customMetadata: {projectId: project.id, type: 'receipt'}}"
      color="teal"
      flat
      bordered
      style="max-width: 300px"
      auto-upload
    /> -->
    <q-table
      :data="transactionsFiltered"
      :columns="columns"
      :rows-per-page-options="[5,10,15,20]"
      row-key="name"
      :visible-columns="visibleColumns"
      :filter="filter"
      rows-per-page-label="Transactions per page:"
      :pagination.sync="pagination"
    >
      <template v-slot:top="props">
        <div class="col-2 q-table__title"> Transactions</div>

        <q-space />

        <!-- <div v-if="$q.screen.gt.xs" class="col">
          <q-toggle v-for="column in columns" v-model="visibleColumns" :val="column.name" :label="column.label" :key="column.name" />
        </div>
 -->    <q-select
          v-model="visibleColumns"
          multiple
          borderless
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          style="min-width: 150px"
        />

        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          flat round dense
          :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="props.toggleFullscreen"
          class="q-ml-md"
        />
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="icon" :props="props">
            <q-icon v-if="props.row.type === 'Cheque'" name="mdi-checkbook" size="md">
              <q-tooltip>
                Cheque
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Cash'" name="mdi-cash" size="md">
              <q-tooltip>
                Cash
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Internet Transfer'" name="mdi-bank-transfer" size="md">
              <q-tooltip>
                Internet Transfer
              </q-tooltip>
            </q-icon>
            <q-icon v-if="props.row.type === 'Bank Card'" name="mdi-credit-card" size="md">
              <q-tooltip>
                Bank Card
              </q-tooltip>
            </q-icon>
          </q-td>
          <q-td key="category" :props="props">
            <!-- {{props.row.category}} -->
            <!-- {{budgets[props.row.category].category}} -->
            {{ getCategoryById(props.row.category) }}
            <q-popup-edit v-model="props.row.category">
              <q-select v-model="props.row.category" dense autofocus label="Category" :options="budgets" option-label="category" option-value="category" />
            </q-popup-edit>
          </q-td>
          <q-td key="desc" :props="props">
            <!-- {{ props.row.text }} -->
            {{ budgets[props.row.category] ? budgets[props.row.category].label : '' }}
            <!-- <q-popup-edit v-model="props.row.desc">
              <q-input v-model="props.row.desc" dense autofocus label="Description" />
            </q-popup-edit> -->
          </q-td>
          <q-td key="number" :props="props">
            <!-- {{props.row.type}} -->

            {{ props.row.id }}
            <q-popup-edit v-model="props.row.number">
              <q-input v-model="props.row.number" dense autofocus counter label="Transaction Number" />
            </q-popup-edit>
          </q-td>
          <q-td key="date" :props="props">
            {{ props.row.date }}
            <q-popup-edit v-model="props.row.date" title="Date">
              <q-date
                v-model="props.row.date"
                dense
                minimal
                label="Date"
              />
            </q-popup-edit>
          </q-td>
          <q-td key="amountAUD" :props="props">
            <!-- {{ getAmount(props.row.text) }} -->
            {{ props.row.amountAUD }}
            <q-popup-edit v-model="props.row.amountAUD">
              <q-input v-model="props.row.amountAUD" dense autofocus label="Amount (AUD)" />
            </q-popup-edit>
          </q-td>
          <q-td key="GST" :props="props">
            <!-- {{ getGST(props.row.text) }} -->
            {{ props.row.GST }}
            <q-popup-edit v-model="props.row.GST">
              <q-input v-model="props.row.GST" dense autofocus label="GST" />
            </q-popup-edit>
          </q-td>
          <q-td key="international" :props="props">
            <q-checkbox :value="props.row.currency !== 'AUD'" disabled/>
          </q-td>
          <q-td key="currency" :props="props">
            {{ props.row.currency }}
            <q-popup-edit v-model="props.row.currency">
              <q-select v-model="props.row.currency" :options="ccOptions" dense autofocus use-input @filter="filterFn" label="Currency">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                    No results
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </q-popup-edit>
          </q-td>
          <q-td key="amountInt" :props="props">
            {{ props.row.amountInt }}
            <q-popup-edit v-model="props.row.amountInt">
              <q-input v-model="props.row.amountInt" dense autofocus label="Amount (Int)" />
            </q-popup-edit>
          </q-td>
          <!-- <q-td key="type" :props="props">
            {{ props.row.type }}
            <q-popup-edit v-model="props.row.type">
              <q-select v-model="props.row.type" :options="typeOptions" dense autofocu label="Type" />
            </q-popup-edit>
          </q-td> -->
          <q-td key="cheque" :props="props">
            {{ props.row.cheque }}
            <q-popup-edit v-model="props.row.cheque">
              <q-input v-model="props.row.cheque" dense autofocus label="Cheque #" />
            </q-popup-edit>
          </q-td>
          <q-td key="deleted" :props="props">
            <!-- {{props.row.deleted}} -->
            <q-checkbox v-model="props.row.deleted"/>
          </q-td>
          <q-td key="receipt" :props="props">
            <!-- <a :href="props.row.receipt">Receipt</a> -->
            <!-- {{getReceipt("the-speaker-grill-small")}} -->
            <sp-receipt :id="props.row.id" :label="props.row.number" :url="props.row.receiptURL" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-page-sticky position="bottom-left" :offset="[18, 18]" style="z-index:100">
      <q-btn fab icon="add" color="primary">
        <q-tooltip content-class="bg-accent text-grey-10">
          Add Transation
        </q-tooltip>
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item>
              <q-item-section>
                Add Transaction
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <!-- <q-date v-model="newTrans.date" dense  /> -->
                <q-input v-model="newTrans.date" mask="date" label="Date" :rules="['date']" dense>
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="newTrans.date" @input="() => $refs.qDateProxy.hide()" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-select v-model="newTrans.category" dense label="Category" :options="budgetOptions" option-label="label" :option-value="(item) => item === null ? null : item.id" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-select v-model="newTrans.type" dense label="Type" :options="typeOptions" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item v-show="newTrans.type === 'Cheque'">
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-input v-model="newTrans.cheque" dense label="Cheque #" />
                <!-- </q-popup-edit> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-input v-model="newTrans.amountAUD" dense label="Amount (AUD)" />
                <!-- </q-popup-edit> -->
              </q-item-section>
              <q-item-section>
              <!-- <q-popup-edit v-model="props.row.category"> -->
                <q-input v-model="newTrans.GST" dense label="GST (AUD)" />
                <!-- </q-popup-edit> -->
                <!-- <q-input :value="newTrans.GST" @input="update($event, 'GST')" dense label="GST (AUD)" /> -->
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>
                <q-firebase-uploader
                  :metadata="{customMetadata: {projectId: project.id, type: newTrans.type, category: newTrans.category.id, amountAUD: newTrans.amountAUD, GST: newTrans.GST, date: newTrans.date}}"
                  color="teal"
                  flat
                  bordered
                  style="max-width: 300px"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script>
// import firebase from 'firebase/app'
// require('firebase/auth')
// require('firebase/firestore')

import { mapGetters } from 'vuex'

var visionData = {
  'textAnnotations': [
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': -53,
            'y': -12
          },
          {
            'x': 2022,
            'y': -12
          },
          {
            'x': 2022,
            'y': 3877
          },
          {
            'x': -53,
            'y': 3877
          }
        ]
      },
      'description': 'chocelles\nColes Supermarkets\nSupermarkets Australia Pty Ltd\nTax Invoice ABN: 45 004 189 708\ncoles\nStore: 4571 - CS WOOLLOONGABBA\nStore Manager: Annalijse\nPhone: 0738965000\nServed By: Assisted Checkout\nRegister: 118\nDate:\n06/09/2019\nReceipt: 1005\nTime: 17:10\nDescription\n4.20\n2.10\n2.10\n-$0.90\n3.00\n1.50\nNORCO NON HOMOGENISE 2LITRE\n% SCHWEPPES MIXERS 1.1LITRE\n% SCHWEPPES MIXERS 1.1LITRE\nSCHWEPPES PEPSI 2 FOR $3.30\nSTRAWBERRIES 250GRAM\n3 @ $1.00 EACH\nMCKENZIES RICE FLOUR 375GRAM\nMCKENZIES LENTILS 375GRAM\nRED CABBAGE HALF 1EACH\nSLEEVED PARSLEY 1BUNCH\nSLEEVED CORIANDER 1BUNCH\nHERB PUN SLV 2 FOR $5\nSWEET GOLD POTATOES PERKG\n0.936 kg NET @ $2.50/kg\nCAULIFLOWER BEACH\n2.30\n2.50\n3.00\n3.00\n-$1.00\n2.34\n2.50\nTotal for 13 items:\n$26.64\nEFT\nGST INCLUDED IN TOTAL\n$26.64\n$0.30\nMORE?\nColes\nQLD AU\n06/09/19 17:10 46294971 NN71B8\n***** 6049\nVISA\nCREDIT ACCOUNT\nHBL Visa Credit\nAPSN 0000 ATC 0098 A0000000031010\nPURCHASE\nAUD$ 26.64\nRRN 001180100500\n(00) APPROVED\nAUTH 572984\nNO PIN OR SIGNATURE REQUIRED\nflybuys Card NO: 279******7824\n% = Taxable items\n*\n**\n*\n*\n**\n*\n*\n*\n*\n*\n**\n*\n*\n*\n*\n**\n*\n*\n*\n*\n**\n*\n*\n*\n*\n*\n*\n*\n*\n*\n*\n**\n*\n*\nTotal Savings\n$1.90\n*\n**\n*\n**\n*\n*\n*\n*\n*\n**\n*\n*\n*\n**\n*\n*\n*\n**\n*\n*\n*\n*\n**\n*\n*\n*\n**\n*\n*\n*\nTotal Savings include any Promotional\nand Loyalty Discounts.\nflybuys points as of yesterday: 55642\n10609194571118100500\n******************************************\nD"ARE OERG STUND JUMP GRENADE GREAT NORTHERN ORGONAL\nSHIRAZ MOUREVORE for only LAGER Battle 6x3Gord) or only\nMUR FINCH CIDER VARIETIES Cos\nhox375mt for only\n$10 OR $13 OR $16\neach\n6 pk\n10 pk\nAND\nAND\nPresent this docket at Liquorlond. Iim tone docket per customer per day Not available to under 18s.\nNorth WA and NT stores excluded. Docket Deol is only valid for redemption in Liquortond NSW.ACT, SA\n& QLD stores, See www lquorland.com.au/Help/Termisconditions for full T .\nID 250\nph\nLIQUORLAND\nue\nValid until 24/09/19\n9 13 13 9 3 8 11 90 170 911\n',
      'locale': 'en'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1606,
            'y': -12
          },
          {
            'x': 1964,
            'y': -12
          },
          {
            'x': 1964,
            'y': 39
          },
          {
            'x': 1606,
            'y': 39
          }
        ]
      },
      'description': 'chocelles'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1108,
            'y': 44
          },
          {
            'x': 1223,
            'y': 63
          },
          {
            'x': 1216,
            'y': 108
          },
          {
            'x': 1101,
            'y': 89
          }
        ]
      },
      'description': 'Coles'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1254,
            'y': 67
          },
          {
            'x': 1525,
            'y': 111
          },
          {
            'x': 1518,
            'y': 157
          },
          {
            'x': 1246,
            'y': 113
          }
        ]
      },
      'description': 'Supermarkets'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1252,
            'y': 85
          },
          {
            'x': 1526,
            'y': 93
          },
          {
            'x': 1525,
            'y': 134
          },
          {
            'x': 1251,
            'y': 126
          }
        ]
      },
      'description': 'Supermarkets'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1553,
            'y': 94
          },
          {
            'x': 1760,
            'y': 100
          },
          {
            'x': 1759,
            'y': 141
          },
          {
            'x': 1552,
            'y': 135
          }
        ]
      },
      'description': 'Australia'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1785,
            'y': 101
          },
          {
            'x': 1854,
            'y': 103
          },
          {
            'x': 1853,
            'y': 143
          },
          {
            'x': 1784,
            'y': 141
          }
        ]
      },
      'description': 'Pty'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1879,
            'y': 103
          },
          {
            'x': 1948,
            'y': 105
          },
          {
            'x': 1947,
            'y': 146
          },
          {
            'x': 1878,
            'y': 144
          }
        ]
      },
      'description': 'Ltd'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1155,
            'y': 118
          },
          {
            'x': 1218,
            'y': 121
          },
          {
            'x': 1216,
            'y': 162
          },
          {
            'x': 1153,
            'y': 159
          }
        ]
      },
      'description': 'Tax'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1256,
            'y': 124
          },
          {
            'x': 1406,
            'y': 132
          },
          {
            'x': 1404,
            'y': 172
          },
          {
            'x': 1254,
            'y': 164
          }
        ]
      },
      'description': 'Invoice'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1439,
            'y': 134
          },
          {
            'x': 1501,
            'y': 137
          },
          {
            'x': 1499,
            'y': 177
          },
          {
            'x': 1437,
            'y': 174
          }
        ]
      },
      'description': 'ABN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1514,
            'y': 138
          },
          {
            'x': 1525,
            'y': 139
          },
          {
            'x': 1523,
            'y': 179
          },
          {
            'x': 1512,
            'y': 178
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1556,
            'y': 140
          },
          {
            'x': 1594,
            'y': 142
          },
          {
            'x': 1592,
            'y': 182
          },
          {
            'x': 1554,
            'y': 180
          }
        ]
      },
      'description': '45'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1626,
            'y': 144
          },
          {
            'x': 1689,
            'y': 147
          },
          {
            'x': 1687,
            'y': 187
          },
          {
            'x': 1624,
            'y': 184
          }
        ]
      },
      'description': '004'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1726,
            'y': 149
          },
          {
            'x': 1784,
            'y': 152
          },
          {
            'x': 1782,
            'y': 192
          },
          {
            'x': 1724,
            'y': 189
          }
        ]
      },
      'description': '189'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1816,
            'y': 154
          },
          {
            'x': 1879,
            'y': 157
          },
          {
            'x': 1877,
            'y': 198
          },
          {
            'x': 1814,
            'y': 195
          }
        ]
      },
      'description': '708'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1305,
            'y': 207
          },
          {
            'x': 1840,
            'y': 207
          },
          {
            'x': 1840,
            'y': 392
          },
          {
            'x': 1305,
            'y': 392
          }
        ]
      },
      'description': 'coles'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1050,
            'y': 369
          },
          {
            'x': 1167,
            'y': 375
          },
          {
            'x': 1165,
            'y': 422
          },
          {
            'x': 1048,
            'y': 416
          }
        ]
      },
      'description': 'Store'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1180,
            'y': 375
          },
          {
            'x': 1193,
            'y': 376
          },
          {
            'x': 1191,
            'y': 423
          },
          {
            'x': 1178,
            'y': 422
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1227,
            'y': 378
          },
          {
            'x': 1311,
            'y': 382
          },
          {
            'x': 1309,
            'y': 429
          },
          {
            'x': 1225,
            'y': 425
          }
        ]
      },
      'description': '4571'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1343,
            'y': 384
          },
          {
            'x': 1356,
            'y': 385
          },
          {
            'x': 1354,
            'y': 432
          },
          {
            'x': 1341,
            'y': 431
          }
        ]
      },
      'description': '-'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1388,
            'y': 386
          },
          {
            'x': 1431,
            'y': 388
          },
          {
            'x': 1429,
            'y': 435
          },
          {
            'x': 1386,
            'y': 433
          }
        ]
      },
      'description': 'CS'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1454,
            'y': 389
          },
          {
            'x': 1756,
            'y': 404
          },
          {
            'x': 1753,
            'y': 452
          },
          {
            'x': 1452,
            'y': 437
          }
        ]
      },
      'description': 'WOOLLOONGABBA'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1049,
            'y': 418
          },
          {
            'x': 1170,
            'y': 426
          },
          {
            'x': 1167,
            'y': 468
          },
          {
            'x': 1046,
            'y': 461
          }
        ]
      },
      'description': 'Store'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1191,
            'y': 427
          },
          {
            'x': 1349,
            'y': 437
          },
          {
            'x': 1346,
            'y': 480
          },
          {
            'x': 1188,
            'y': 470
          }
        ]
      },
      'description': 'Manager'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1367,
            'y': 439
          },
          {
            'x': 1378,
            'y': 440
          },
          {
            'x': 1375,
            'y': 482
          },
          {
            'x': 1364,
            'y': 481
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1406,
            'y': 440
          },
          {
            'x': 1613,
            'y': 453
          },
          {
            'x': 1610,
            'y': 497
          },
          {
            'x': 1403,
            'y': 484
          }
        ]
      },
      'description': 'Annalijse'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1050,
            'y': 467
          },
          {
            'x': 1168,
            'y': 474
          },
          {
            'x': 1165,
            'y': 515
          },
          {
            'x': 1048,
            'y': 508
          }
        ]
      },
      'description': 'Phone'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1176,
            'y': 475
          },
          {
            'x': 1187,
            'y': 476
          },
          {
            'x': 1185,
            'y': 516
          },
          {
            'x': 1174,
            'y': 515
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1312,
            'y': 483
          },
          {
            'x': 1537,
            'y': 496
          },
          {
            'x': 1534,
            'y': 537
          },
          {
            'x': 1310,
            'y': 524
          }
        ]
      },
      'description': '0738965000'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1048,
            'y': 518
          },
          {
            'x': 1186,
            'y': 525
          },
          {
            'x': 1184,
            'y': 565
          },
          {
            'x': 1046,
            'y': 558
          }
        ]
      },
      'description': 'Served'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1213,
            'y': 526
          },
          {
            'x': 1256,
            'y': 528
          },
          {
            'x': 1254,
            'y': 568
          },
          {
            'x': 1211,
            'y': 566
          }
        ]
      },
      'description': 'By'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1270,
            'y': 528
          },
          {
            'x': 1281,
            'y': 529
          },
          {
            'x': 1279,
            'y': 568
          },
          {
            'x': 1268,
            'y': 568
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1311,
            'y': 530
          },
          {
            'x': 1492,
            'y': 539
          },
          {
            'x': 1490,
            'y': 580
          },
          {
            'x': 1309,
            'y': 571
          }
        ]
      },
      'description': 'Assisted'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1521,
            'y': 540
          },
          {
            'x': 1712,
            'y': 549
          },
          {
            'x': 1710,
            'y': 590
          },
          {
            'x': 1519,
            'y': 581
          }
        ]
      },
      'description': 'Checkout'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1041,
            'y': 557
          },
          {
            'x': 1226,
            'y': 573
          },
          {
            'x': 1223,
            'y': 615
          },
          {
            'x': 1037,
            'y': 599
          }
        ]
      },
      'description': 'Register'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1243,
            'y': 576
          },
          {
            'x': 1254,
            'y': 577
          },
          {
            'x': 1250,
            'y': 618
          },
          {
            'x': 1239,
            'y': 617
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1316,
            'y': 581
          },
          {
            'x': 1375,
            'y': 586
          },
          {
            'x': 1371,
            'y': 627
          },
          {
            'x': 1312,
            'y': 622
          }
        ]
      },
      'description': '118'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1045,
            'y': 602
          },
          {
            'x': 1134,
            'y': 612
          },
          {
            'x': 1130,
            'y': 652
          },
          {
            'x': 1041,
            'y': 642
          }
        ]
      },
      'description': 'Date'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1151,
            'y': 615
          },
          {
            'x': 1162,
            'y': 616
          },
          {
            'x': 1158,
            'y': 656
          },
          {
            'x': 1147,
            'y': 655
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1308,
            'y': 627
          },
          {
            'x': 1344,
            'y': 627
          },
          {
            'x': 1344,
            'y': 677
          },
          {
            'x': 1308,
            'y': 677
          }
        ]
      },
      'description': '06'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1360,
            'y': 627
          },
          {
            'x': 1374,
            'y': 627
          },
          {
            'x': 1374,
            'y': 677
          },
          {
            'x': 1360,
            'y': 677
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1376,
            'y': 627
          },
          {
            'x': 1423,
            'y': 627
          },
          {
            'x': 1423,
            'y': 677
          },
          {
            'x': 1376,
            'y': 677
          }
        ]
      },
      'description': '09'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1431,
            'y': 627
          },
          {
            'x': 1445,
            'y': 627
          },
          {
            'x': 1445,
            'y': 677
          },
          {
            'x': 1431,
            'y': 677
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1456,
            'y': 627
          },
          {
            'x': 1538,
            'y': 627
          },
          {
            'x': 1538,
            'y': 677
          },
          {
            'x': 1456,
            'y': 677
          }
        ]
      },
      'description': '2019'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1686,
            'y': 585
          },
          {
            'x': 1856,
            'y': 585
          },
          {
            'x': 1856,
            'y': 635
          },
          {
            'x': 1686,
            'y': 635
          }
        ]
      },
      'description': 'Receipt'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1858,
            'y': 585
          },
          {
            'x': 1872,
            'y': 585
          },
          {
            'x': 1872,
            'y': 635
          },
          {
            'x': 1858,
            'y': 635
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1908,
            'y': 585
          },
          {
            'x': 1992,
            'y': 585
          },
          {
            'x': 1992,
            'y': 635
          },
          {
            'x': 1908,
            'y': 635
          }
        ]
      },
      'description': '1005'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1691,
            'y': 637
          },
          {
            'x': 1773,
            'y': 636
          },
          {
            'x': 1774,
            'y': 677
          },
          {
            'x': 1692,
            'y': 678
          }
        ]
      },
      'description': 'Time'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1787,
            'y': 636
          },
          {
            'x': 1798,
            'y': 636
          },
          {
            'x': 1799,
            'y': 676
          },
          {
            'x': 1788,
            'y': 676
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1882,
            'y': 635
          },
          {
            'x': 1920,
            'y': 635
          },
          {
            'x': 1921,
            'y': 675
          },
          {
            'x': 1883,
            'y': 675
          }
        ]
      },
      'description': '17'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1930,
            'y': 635
          },
          {
            'x': 1941,
            'y': 635
          },
          {
            'x': 1942,
            'y': 675
          },
          {
            'x': 1931,
            'y': 675
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1954,
            'y': 634
          },
          {
            'x': 1983,
            'y': 634
          },
          {
            'x': 1984,
            'y': 674
          },
          {
            'x': 1955,
            'y': 674
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1043,
            'y': 696
          },
          {
            'x': 1303,
            'y': 711
          },
          {
            'x': 1300,
            'y': 761
          },
          {
            'x': 1040,
            'y': 746
          }
        ]
      },
      'description': 'Description'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1904,
            'y': 820
          },
          {
            'x': 1916,
            'y': 820
          },
          {
            'x': 1916,
            'y': 863
          },
          {
            'x': 1904,
            'y': 863
          }
        ]
      },
      'description': '4'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 820
          },
          {
            'x': 1938,
            'y': 820
          },
          {
            'x': 1938,
            'y': 863
          },
          {
            'x': 1926,
            'y': 863
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1952,
            'y': 820
          },
          {
            'x': 1983,
            'y': 820
          },
          {
            'x': 1983,
            'y': 863
          },
          {
            'x': 1952,
            'y': 863
          }
        ]
      },
      'description': '20'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1904,
            'y': 868
          },
          {
            'x': 1916,
            'y': 868
          },
          {
            'x': 1916,
            'y': 911
          },
          {
            'x': 1904,
            'y': 911
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 868
          },
          {
            'x': 1938,
            'y': 868
          },
          {
            'x': 1938,
            'y': 911
          },
          {
            'x': 1926,
            'y': 911
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1952,
            'y': 868
          },
          {
            'x': 1983,
            'y': 868
          },
          {
            'x': 1983,
            'y': 911
          },
          {
            'x': 1952,
            'y': 911
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1903,
            'y': 913
          },
          {
            'x': 1916,
            'y': 913
          },
          {
            'x': 1916,
            'y': 961
          },
          {
            'x': 1903,
            'y': 961
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1928,
            'y': 913
          },
          {
            'x': 1941,
            'y': 913
          },
          {
            'x': 1941,
            'y': 961
          },
          {
            'x': 1928,
            'y': 961
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1951,
            'y': 913
          },
          {
            'x': 1987,
            'y': 913
          },
          {
            'x': 1987,
            'y': 961
          },
          {
            'x': 1951,
            'y': 961
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1856,
            'y': 964
          },
          {
            'x': 1868,
            'y': 964
          },
          {
            'x': 1868,
            'y': 1007
          },
          {
            'x': 1856,
            'y': 1007
          }
        ]
      },
      'description': '-'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1878,
            'y': 964
          },
          {
            'x': 1890,
            'y': 964
          },
          {
            'x': 1890,
            'y': 1007
          },
          {
            'x': 1878,
            'y': 1007
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1900,
            'y': 964
          },
          {
            'x': 1912,
            'y': 964
          },
          {
            'x': 1912,
            'y': 1007
          },
          {
            'x': 1900,
            'y': 1007
          }
        ]
      },
      'description': '0'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 964
          },
          {
            'x': 1938,
            'y': 964
          },
          {
            'x': 1938,
            'y': 1007
          },
          {
            'x': 1926,
            'y': 1007
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1952,
            'y': 964
          },
          {
            'x': 1983,
            'y': 964
          },
          {
            'x': 1983,
            'y': 1007
          },
          {
            'x': 1952,
            'y': 1007
          }
        ]
      },
      'description': '90'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1905,
            'y': 1012
          },
          {
            'x': 1917,
            'y': 1012
          },
          {
            'x': 1917,
            'y': 1055
          },
          {
            'x': 1905,
            'y': 1055
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1927,
            'y': 1012
          },
          {
            'x': 1939,
            'y': 1012
          },
          {
            'x': 1939,
            'y': 1055
          },
          {
            'x': 1927,
            'y': 1055
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1946,
            'y': 1012
          },
          {
            'x': 1986,
            'y': 1012
          },
          {
            'x': 1986,
            'y': 1055
          },
          {
            'x': 1946,
            'y': 1055
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1903,
            'y': 1111
          },
          {
            'x': 1914,
            'y': 1110
          },
          {
            'x': 1918,
            'y': 1150
          },
          {
            'x': 1907,
            'y': 1151
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1923,
            'y': 1109
          },
          {
            'x': 1934,
            'y': 1108
          },
          {
            'x': 1938,
            'y': 1148
          },
          {
            'x': 1927,
            'y': 1149
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1941,
            'y': 1108
          },
          {
            'x': 1982,
            'y': 1104
          },
          {
            'x': 1986,
            'y': 1143
          },
          {
            'x': 1945,
            'y': 1148
          }
        ]
      },
      'description': '50'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1086,
            'y': 800
          },
          {
            'x': 1204,
            'y': 805
          },
          {
            'x': 1202,
            'y': 846
          },
          {
            'x': 1084,
            'y': 841
          }
        ]
      },
      'description': 'NORCO'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1229,
            'y': 807
          },
          {
            'x': 1297,
            'y': 810
          },
          {
            'x': 1295,
            'y': 850
          },
          {
            'x': 1227,
            'y': 847
          }
        ]
      },
      'description': 'NON'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1327,
            'y': 811
          },
          {
            'x': 1559,
            'y': 822
          },
          {
            'x': 1557,
            'y': 863
          },
          {
            'x': 1325,
            'y': 852
          }
        ]
      },
      'description': 'HOMOGENISE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1591,
            'y': 823
          },
          {
            'x': 1724,
            'y': 829
          },
          {
            'x': 1722,
            'y': 870
          },
          {
            'x': 1589,
            'y': 864
          }
        ]
      },
      'description': '2LITRE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1041,
            'y': 844
          },
          {
            'x': 1052,
            'y': 845
          },
          {
            'x': 1050,
            'y': 885
          },
          {
            'x': 1039,
            'y': 884
          }
        ]
      },
      'description': '%'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1086,
            'y': 846
          },
          {
            'x': 1297,
            'y': 857
          },
          {
            'x': 1295,
            'y': 898
          },
          {
            'x': 1084,
            'y': 887
          }
        ]
      },
      'description': 'SCHWEPPES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1322,
            'y': 859
          },
          {
            'x': 1467,
            'y': 867
          },
          {
            'x': 1465,
            'y': 908
          },
          {
            'x': 1320,
            'y': 900
          }
        ]
      },
      'description': 'MIXERS'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1499,
            'y': 868
          },
          {
            'x': 1510,
            'y': 869
          },
          {
            'x': 1508,
            'y': 909
          },
          {
            'x': 1497,
            'y': 908
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1523,
            'y': 869
          },
          {
            'x': 1534,
            'y': 870
          },
          {
            'x': 1532,
            'y': 910
          },
          {
            'x': 1521,
            'y': 909
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1547,
            'y': 870
          },
          {
            'x': 1673,
            'y': 877
          },
          {
            'x': 1671,
            'y': 918
          },
          {
            'x': 1545,
            'y': 911
          }
        ]
      },
      'description': '1LITRE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1038,
            'y': 892
          },
          {
            'x': 1049,
            'y': 893
          },
          {
            'x': 1047,
            'y': 934
          },
          {
            'x': 1036,
            'y': 933
          }
        ]
      },
      'description': '%'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1084,
            'y': 894
          },
          {
            'x': 1298,
            'y': 905
          },
          {
            'x': 1295,
            'y': 947
          },
          {
            'x': 1082,
            'y': 936
          }
        ]
      },
      'description': 'SCHWEPPES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1322,
            'y': 906
          },
          {
            'x': 1465,
            'y': 914
          },
          {
            'x': 1463,
            'y': 955
          },
          {
            'x': 1320,
            'y': 948
          }
        ]
      },
      'description': 'MIXERS'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1499,
            'y': 916
          },
          {
            'x': 1510,
            'y': 917
          },
          {
            'x': 1508,
            'y': 958
          },
          {
            'x': 1497,
            'y': 957
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1520,
            'y': 917
          },
          {
            'x': 1531,
            'y': 918
          },
          {
            'x': 1529,
            'y': 959
          },
          {
            'x': 1518,
            'y': 958
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1548,
            'y': 918
          },
          {
            'x': 1673,
            'y': 925
          },
          {
            'x': 1671,
            'y': 967
          },
          {
            'x': 1546,
            'y': 960
          }
        ]
      },
      'description': '1LITRE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1037,
            'y': 942
          },
          {
            'x': 1247,
            'y': 952
          },
          {
            'x': 1245,
            'y': 992
          },
          {
            'x': 1035,
            'y': 982
          }
        ]
      },
      'description': 'SCHWEPPES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1277,
            'y': 953
          },
          {
            'x': 1397,
            'y': 958
          },
          {
            'x': 1395,
            'y': 998
          },
          {
            'x': 1275,
            'y': 993
          }
        ]
      },
      'description': 'PEPSI'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1425,
            'y': 959
          },
          {
            'x': 1436,
            'y': 960
          },
          {
            'x': 1434,
            'y': 999
          },
          {
            'x': 1423,
            'y': 999
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1471,
            'y': 962
          },
          {
            'x': 1533,
            'y': 965
          },
          {
            'x': 1531,
            'y': 1005
          },
          {
            'x': 1469,
            'y': 1002
          }
        ]
      },
      'description': 'FOR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1567,
            'y': 966
          },
          {
            'x': 1578,
            'y': 967
          },
          {
            'x': 1576,
            'y': 1006
          },
          {
            'x': 1565,
            'y': 1006
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1592,
            'y': 967
          },
          {
            'x': 1603,
            'y': 968
          },
          {
            'x': 1601,
            'y': 1007
          },
          {
            'x': 1590,
            'y': 1007
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1617,
            'y': 968
          },
          {
            'x': 1628,
            'y': 969
          },
          {
            'x': 1626,
            'y': 1008
          },
          {
            'x': 1615,
            'y': 1008
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1638,
            'y': 969
          },
          {
            'x': 1676,
            'y': 971
          },
          {
            'x': 1674,
            'y': 1011
          },
          {
            'x': 1636,
            'y': 1009
          }
        ]
      },
      'description': '30'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1080,
            'y': 993
          },
          {
            'x': 1368,
            'y': 1007
          },
          {
            'x': 1366,
            'y': 1050
          },
          {
            'x': 1078,
            'y': 1036
          }
        ]
      },
      'description': 'STRAWBERRIES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1402,
            'y': 1008
          },
          {
            'x': 1554,
            'y': 1015
          },
          {
            'x': 1552,
            'y': 1058
          },
          {
            'x': 1400,
            'y': 1051
          }
        ]
      },
      'description': '250GRAM'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1160,
            'y': 1045
          },
          {
            'x': 1173,
            'y': 1046
          },
          {
            'x': 1171,
            'y': 1092
          },
          {
            'x': 1158,
            'y': 1091
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1207,
            'y': 1047
          },
          {
            'x': 1220,
            'y': 1048
          },
          {
            'x': 1218,
            'y': 1094
          },
          {
            'x': 1205,
            'y': 1093
          }
        ]
      },
      'description': '@'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1254,
            'y': 1049
          },
          {
            'x': 1267,
            'y': 1050
          },
          {
            'x': 1265,
            'y': 1096
          },
          {
            'x': 1252,
            'y': 1095
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1282,
            'y': 1051
          },
          {
            'x': 1295,
            'y': 1052
          },
          {
            'x': 1293,
            'y': 1098
          },
          {
            'x': 1280,
            'y': 1097
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1305,
            'y': 1052
          },
          {
            'x': 1318,
            'y': 1053
          },
          {
            'x': 1316,
            'y': 1099
          },
          {
            'x': 1303,
            'y': 1098
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1328,
            'y': 1052
          },
          {
            'x': 1362,
            'y': 1053
          },
          {
            'x': 1360,
            'y': 1100
          },
          {
            'x': 1326,
            'y': 1099
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1397,
            'y': 1056
          },
          {
            'x': 1479,
            'y': 1060
          },
          {
            'x': 1477,
            'y': 1105
          },
          {
            'x': 1395,
            'y': 1102
          }
        ]
      },
      'description': 'EACH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1075,
            'y': 1095
          },
          {
            'x': 1291,
            'y': 1101
          },
          {
            'x': 1290,
            'y': 1142
          },
          {
            'x': 1074,
            'y': 1136
          }
        ]
      },
      'description': 'MCKENZIES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1315,
            'y': 1102
          },
          {
            'x': 1410,
            'y': 1104
          },
          {
            'x': 1409,
            'y': 1144
          },
          {
            'x': 1314,
            'y': 1142
          }
        ]
      },
      'description': 'RICE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1441,
            'y': 1105
          },
          {
            'x': 1555,
            'y': 1108
          },
          {
            'x': 1554,
            'y': 1149
          },
          {
            'x': 1440,
            'y': 1146
          }
        ]
      },
      'description': 'FLOUR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1590,
            'y': 1108
          },
          {
            'x': 1741,
            'y': 1112
          },
          {
            'x': 1740,
            'y': 1153
          },
          {
            'x': 1589,
            'y': 1149
          }
        ]
      },
      'description': '375GRAM'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1075,
            'y': 1141
          },
          {
            'x': 1291,
            'y': 1149
          },
          {
            'x': 1289,
            'y': 1190
          },
          {
            'x': 1074,
            'y': 1182
          }
        ]
      },
      'description': 'MCKENZIES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1317,
            'y': 1150
          },
          {
            'x': 1486,
            'y': 1156
          },
          {
            'x': 1484,
            'y': 1197
          },
          {
            'x': 1316,
            'y': 1191
          }
        ]
      },
      'description': 'LENTILS'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1515,
            'y': 1157
          },
          {
            'x': 1672,
            'y': 1163
          },
          {
            'x': 1670,
            'y': 1204
          },
          {
            'x': 1514,
            'y': 1198
          }
        ]
      },
      'description': '375GRAM'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1075,
            'y': 1191
          },
          {
            'x': 1145,
            'y': 1193
          },
          {
            'x': 1144,
            'y': 1234
          },
          {
            'x': 1074,
            'y': 1232
          }
        ]
      },
      'description': 'RED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1174,
            'y': 1194
          },
          {
            'x': 1336,
            'y': 1199
          },
          {
            'x': 1335,
            'y': 1240
          },
          {
            'x': 1173,
            'y': 1235
          }
        ]
      },
      'description': 'CABBAGE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1367,
            'y': 1201
          },
          {
            'x': 1455,
            'y': 1204
          },
          {
            'x': 1454,
            'y': 1245
          },
          {
            'x': 1366,
            'y': 1242
          }
        ]
      },
      'description': 'HALF'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1492,
            'y': 1205
          },
          {
            'x': 1600,
            'y': 1209
          },
          {
            'x': 1599,
            'y': 1250
          },
          {
            'x': 1491,
            'y': 1246
          }
        ]
      },
      'description': '1EACH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1074,
            'y': 1236
          },
          {
            'x': 1237,
            'y': 1242
          },
          {
            'x': 1235,
            'y': 1290
          },
          {
            'x': 1072,
            'y': 1284
          }
        ]
      },
      'description': 'SLEEVED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1264,
            'y': 1243
          },
          {
            'x': 1434,
            'y': 1249
          },
          {
            'x': 1432,
            'y': 1297
          },
          {
            'x': 1262,
            'y': 1291
          }
        ]
      },
      'description': 'PARSLEY'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1470,
            'y': 1251
          },
          {
            'x': 1602,
            'y': 1256
          },
          {
            'x': 1600,
            'y': 1304
          },
          {
            'x': 1468,
            'y': 1299
          }
        ]
      },
      'description': '1BUNCH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1074,
            'y': 1289
          },
          {
            'x': 1238,
            'y': 1293
          },
          {
            'x': 1237,
            'y': 1340
          },
          {
            'x': 1073,
            'y': 1336
          }
        ]
      },
      'description': 'SLEEVED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1273,
            'y': 1294
          },
          {
            'x': 1478,
            'y': 1300
          },
          {
            'x': 1477,
            'y': 1347
          },
          {
            'x': 1272,
            'y': 1341
          }
        ]
      },
      'description': 'CORIANDER'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1518,
            'y': 1301
          },
          {
            'x': 1646,
            'y': 1304
          },
          {
            'x': 1645,
            'y': 1351
          },
          {
            'x': 1517,
            'y': 1348
          }
        ]
      },
      'description': '1BUNCH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1024,
            'y': 1333
          },
          {
            'x': 1115,
            'y': 1336
          },
          {
            'x': 1113,
            'y': 1383
          },
          {
            'x': 1022,
            'y': 1380
          }
        ]
      },
      'description': 'HERB'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1151,
            'y': 1337
          },
          {
            'x': 1218,
            'y': 1340
          },
          {
            'x': 1216,
            'y': 1388
          },
          {
            'x': 1149,
            'y': 1385
          }
        ]
      },
      'description': 'PUN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1245,
            'y': 1341
          },
          {
            'x': 1312,
            'y': 1344
          },
          {
            'x': 1310,
            'y': 1391
          },
          {
            'x': 1243,
            'y': 1388
          }
        ]
      },
      'description': 'SLV'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1348,
            'y': 1345
          },
          {
            'x': 1361,
            'y': 1345
          },
          {
            'x': 1359,
            'y': 1392
          },
          {
            'x': 1346,
            'y': 1392
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1389,
            'y': 1347
          },
          {
            'x': 1456,
            'y': 1350
          },
          {
            'x': 1454,
            'y': 1397
          },
          {
            'x': 1387,
            'y': 1394
          }
        ]
      },
      'description': 'FOR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1488,
            'y': 1350
          },
          {
            'x': 1501,
            'y': 1350
          },
          {
            'x': 1499,
            'y': 1397
          },
          {
            'x': 1486,
            'y': 1397
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1512,
            'y': 1351
          },
          {
            'x': 1525,
            'y': 1351
          },
          {
            'x': 1523,
            'y': 1398
          },
          {
            'x': 1510,
            'y': 1398
          }
        ]
      },
      'description': '5'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1073,
            'y': 1386
          },
          {
            'x': 1191,
            'y': 1389
          },
          {
            'x': 1190,
            'y': 1436
          },
          {
            'x': 1072,
            'y': 1433
          }
        ]
      },
      'description': 'SWEET'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1218,
            'y': 1390
          },
          {
            'x': 1307,
            'y': 1392
          },
          {
            'x': 1306,
            'y': 1439
          },
          {
            'x': 1217,
            'y': 1437
          }
        ]
      },
      'description': 'GOLD'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1340,
            'y': 1393
          },
          {
            'x': 1530,
            'y': 1398
          },
          {
            'x': 1529,
            'y': 1445
          },
          {
            'x': 1339,
            'y': 1440
          }
        ]
      },
      'description': 'POTATOES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1550,
            'y': 1399
          },
          {
            'x': 1669,
            'y': 1402
          },
          {
            'x': 1668,
            'y': 1449
          },
          {
            'x': 1549,
            'y': 1446
          }
        ]
      },
      'description': 'PERKG'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1144,
            'y': 1438
          },
          {
            'x': 1157,
            'y': 1438
          },
          {
            'x': 1156,
            'y': 1485
          },
          {
            'x': 1143,
            'y': 1485
          }
        ]
      },
      'description': '0'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1173,
            'y': 1438
          },
          {
            'x': 1186,
            'y': 1438
          },
          {
            'x': 1185,
            'y': 1485
          },
          {
            'x': 1172,
            'y': 1485
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1194,
            'y': 1439
          },
          {
            'x': 1254,
            'y': 1441
          },
          {
            'x': 1253,
            'y': 1488
          },
          {
            'x': 1193,
            'y': 1486
          }
        ]
      },
      'description': '936'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1284,
            'y': 1441
          },
          {
            'x': 1335,
            'y': 1442
          },
          {
            'x': 1334,
            'y': 1489
          },
          {
            'x': 1283,
            'y': 1488
          }
        ]
      },
      'description': 'kg'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1362,
            'y': 1443
          },
          {
            'x': 1436,
            'y': 1445
          },
          {
            'x': 1435,
            'y': 1493
          },
          {
            'x': 1361,
            'y': 1491
          }
        ]
      },
      'description': 'NET'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1461,
            'y': 1446
          },
          {
            'x': 1474,
            'y': 1446
          },
          {
            'x': 1473,
            'y': 1493
          },
          {
            'x': 1460,
            'y': 1493
          }
        ]
      },
      'description': '@'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1509,
            'y': 1447
          },
          {
            'x': 1522,
            'y': 1447
          },
          {
            'x': 1521,
            'y': 1494
          },
          {
            'x': 1508,
            'y': 1494
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1538,
            'y': 1448
          },
          {
            'x': 1551,
            'y': 1448
          },
          {
            'x': 1550,
            'y': 1495
          },
          {
            'x': 1537,
            'y': 1495
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1562,
            'y': 1449
          },
          {
            'x': 1575,
            'y': 1449
          },
          {
            'x': 1574,
            'y': 1496
          },
          {
            'x': 1561,
            'y': 1496
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1578,
            'y': 1449
          },
          {
            'x': 1621,
            'y': 1450
          },
          {
            'x': 1620,
            'y': 1497
          },
          {
            'x': 1577,
            'y': 1496
          }
        ]
      },
      'description': '50'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1634,
            'y': 1451
          },
          {
            'x': 1647,
            'y': 1451
          },
          {
            'x': 1646,
            'y': 1498
          },
          {
            'x': 1633,
            'y': 1498
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1642,
            'y': 1451
          },
          {
            'x': 1702,
            'y': 1453
          },
          {
            'x': 1701,
            'y': 1500
          },
          {
            'x': 1641,
            'y': 1498
          }
        ]
      },
      'description': 'kg'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1069,
            'y': 1484
          },
          {
            'x': 1332,
            'y': 1491
          },
          {
            'x': 1331,
            'y': 1539
          },
          {
            'x': 1068,
            'y': 1532
          }
        ]
      },
      'description': 'CAULIFLOWER'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1367,
            'y': 1493
          },
          {
            'x': 1476,
            'y': 1496
          },
          {
            'x': 1475,
            'y': 1543
          },
          {
            'x': 1366,
            'y': 1540
          }
        ]
      },
      'description': 'BEACH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1899,
            'y': 1155
          },
          {
            'x': 1912,
            'y': 1155
          },
          {
            'x': 1912,
            'y': 1201
          },
          {
            'x': 1899,
            'y': 1201
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1927,
            'y': 1155
          },
          {
            'x': 1940,
            'y': 1155
          },
          {
            'x': 1940,
            'y': 1201
          },
          {
            'x': 1927,
            'y': 1201
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1949,
            'y': 1155
          },
          {
            'x': 1983,
            'y': 1155
          },
          {
            'x': 1983,
            'y': 1201
          },
          {
            'x': 1949,
            'y': 1201
          }
        ]
      },
      'description': '30'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1902,
            'y': 1200
          },
          {
            'x': 1916,
            'y': 1200
          },
          {
            'x': 1916,
            'y': 1251
          },
          {
            'x': 1902,
            'y': 1251
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1928,
            'y': 1200
          },
          {
            'x': 1942,
            'y': 1200
          },
          {
            'x': 1942,
            'y': 1251
          },
          {
            'x': 1928,
            'y': 1251
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1940,
            'y': 1200
          },
          {
            'x': 1987,
            'y': 1200
          },
          {
            'x': 1987,
            'y': 1251
          },
          {
            'x': 1940,
            'y': 1251
          }
        ]
      },
      'description': '50'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1901,
            'y': 1256
          },
          {
            'x': 1913,
            'y': 1256
          },
          {
            'x': 1913,
            'y': 1299
          },
          {
            'x': 1901,
            'y': 1299
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1927,
            'y': 1256
          },
          {
            'x': 1939,
            'y': 1256
          },
          {
            'x': 1939,
            'y': 1299
          },
          {
            'x': 1927,
            'y': 1299
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1947,
            'y': 1256
          },
          {
            'x': 1986,
            'y': 1256
          },
          {
            'x': 1986,
            'y': 1299
          },
          {
            'x': 1947,
            'y': 1299
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1900,
            'y': 1305
          },
          {
            'x': 1911,
            'y': 1305
          },
          {
            'x': 1911,
            'y': 1347
          },
          {
            'x': 1900,
            'y': 1347
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 1305
          },
          {
            'x': 1937,
            'y': 1305
          },
          {
            'x': 1937,
            'y': 1347
          },
          {
            'x': 1926,
            'y': 1347
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1944,
            'y': 1305
          },
          {
            'x': 1983,
            'y': 1305
          },
          {
            'x': 1983,
            'y': 1347
          },
          {
            'x': 1944,
            'y': 1347
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1851,
            'y': 1356
          },
          {
            'x': 1863,
            'y': 1356
          },
          {
            'x': 1863,
            'y': 1399
          },
          {
            'x': 1851,
            'y': 1399
          }
        ]
      },
      'description': '-'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1873,
            'y': 1356
          },
          {
            'x': 1885,
            'y': 1356
          },
          {
            'x': 1885,
            'y': 1399
          },
          {
            'x': 1873,
            'y': 1399
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1900,
            'y': 1356
          },
          {
            'x': 1912,
            'y': 1356
          },
          {
            'x': 1912,
            'y': 1399
          },
          {
            'x': 1900,
            'y': 1399
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 1356
          },
          {
            'x': 1938,
            'y': 1356
          },
          {
            'x': 1938,
            'y': 1399
          },
          {
            'x': 1926,
            'y': 1399
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1946,
            'y': 1356
          },
          {
            'x': 1985,
            'y': 1356
          },
          {
            'x': 1985,
            'y': 1399
          },
          {
            'x': 1946,
            'y': 1399
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1883,
            'y': 1405
          },
          {
            'x': 1895,
            'y': 1405
          },
          {
            'x': 1895,
            'y': 1449
          },
          {
            'x': 1883,
            'y': 1449
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1919,
            'y': 1405
          },
          {
            'x': 1931,
            'y': 1405
          },
          {
            'x': 1931,
            'y': 1449
          },
          {
            'x': 1919,
            'y': 1449
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1930,
            'y': 1405
          },
          {
            'x': 1970,
            'y': 1405
          },
          {
            'x': 1970,
            'y': 1449
          },
          {
            'x': 1930,
            'y': 1449
          }
        ]
      },
      'description': '34'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1897,
            'y': 1499
          },
          {
            'x': 1910,
            'y': 1499
          },
          {
            'x': 1910,
            'y': 1545
          },
          {
            'x': 1897,
            'y': 1545
          }
        ]
      },
      'description': '2'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1921,
            'y': 1499
          },
          {
            'x': 1934,
            'y': 1499
          },
          {
            'x': 1934,
            'y': 1545
          },
          {
            'x': 1921,
            'y': 1545
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1941,
            'y': 1499
          },
          {
            'x': 1983,
            'y': 1499
          },
          {
            'x': 1983,
            'y': 1545
          },
          {
            'x': 1941,
            'y': 1545
          }
        ]
      },
      'description': '50'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1020,
            'y': 1581
          },
          {
            'x': 1142,
            'y': 1585
          },
          {
            'x': 1140,
            'y': 1632
          },
          {
            'x': 1018,
            'y': 1628
          }
        ]
      },
      'description': 'Total'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1169,
            'y': 1585
          },
          {
            'x': 1229,
            'y': 1587
          },
          {
            'x': 1227,
            'y': 1635
          },
          {
            'x': 1167,
            'y': 1633
          }
        ]
      },
      'description': 'for'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1271,
            'y': 1589
          },
          {
            'x': 1306,
            'y': 1590
          },
          {
            'x': 1304,
            'y': 1637
          },
          {
            'x': 1269,
            'y': 1636
          }
        ]
      },
      'description': '13'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1341,
            'y': 1592
          },
          {
            'x': 1454,
            'y': 1596
          },
          {
            'x': 1452,
            'y': 1643
          },
          {
            'x': 1339,
            'y': 1639
          }
        ]
      },
      'description': 'items'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1464,
            'y': 1596
          },
          {
            'x': 1477,
            'y': 1596
          },
          {
            'x': 1475,
            'y': 1643
          },
          {
            'x': 1462,
            'y': 1643
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1847,
            'y': 1599
          },
          {
            'x': 1860,
            'y': 1599
          },
          {
            'x': 1860,
            'y': 1647
          },
          {
            'x': 1847,
            'y': 1647
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1877,
            'y': 1599
          },
          {
            'x': 1903,
            'y': 1599
          },
          {
            'x': 1903,
            'y': 1647
          },
          {
            'x': 1877,
            'y': 1647
          }
        ]
      },
      'description': '26'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1920,
            'y': 1599
          },
          {
            'x': 1933,
            'y': 1599
          },
          {
            'x': 1933,
            'y': 1647
          },
          {
            'x': 1920,
            'y': 1647
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1935,
            'y': 1599
          },
          {
            'x': 1987,
            'y': 1599
          },
          {
            'x': 1987,
            'y': 1647
          },
          {
            'x': 1935,
            'y': 1647
          }
        ]
      },
      'description': '64'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1009,
            'y': 1681
          },
          {
            'x': 1085,
            'y': 1681
          },
          {
            'x': 1085,
            'y': 1725
          },
          {
            'x': 1009,
            'y': 1725
          }
        ]
      },
      'description': 'EFT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1012,
            'y': 1726
          },
          {
            'x': 1086,
            'y': 1727
          },
          {
            'x': 1085,
            'y': 1786
          },
          {
            'x': 1011,
            'y': 1785
          }
        ]
      },
      'description': 'GST'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1123,
            'y': 1728
          },
          {
            'x': 1304,
            'y': 1731
          },
          {
            'x': 1303,
            'y': 1789
          },
          {
            'x': 1122,
            'y': 1786
          }
        ]
      },
      'description': 'INCLUDED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1340,
            'y': 1731
          },
          {
            'x': 1373,
            'y': 1732
          },
          {
            'x': 1372,
            'y': 1791
          },
          {
            'x': 1339,
            'y': 1790
          }
        ]
      },
      'description': 'IN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1417,
            'y': 1732
          },
          {
            'x': 1522,
            'y': 1734
          },
          {
            'x': 1521,
            'y': 1793
          },
          {
            'x': 1416,
            'y': 1791
          }
        ]
      },
      'description': 'TOTAL'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1842,
            'y': 1696
          },
          {
            'x': 1856,
            'y': 1696
          },
          {
            'x': 1856,
            'y': 1747
          },
          {
            'x': 1842,
            'y': 1747
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1873,
            'y': 1696
          },
          {
            'x': 1902,
            'y': 1696
          },
          {
            'x': 1902,
            'y': 1747
          },
          {
            'x': 1873,
            'y': 1747
          }
        ]
      },
      'description': '26'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1920,
            'y': 1696
          },
          {
            'x': 1934,
            'y': 1696
          },
          {
            'x': 1934,
            'y': 1747
          },
          {
            'x': 1920,
            'y': 1747
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1937,
            'y': 1696
          },
          {
            'x': 1984,
            'y': 1696
          },
          {
            'x': 1984,
            'y': 1747
          },
          {
            'x': 1937,
            'y': 1747
          }
        ]
      },
      'description': '64'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1868,
            'y': 1755
          },
          {
            'x': 1880,
            'y': 1755
          },
          {
            'x': 1881,
            'y': 1798
          },
          {
            'x': 1869,
            'y': 1798
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1890,
            'y': 1755
          },
          {
            'x': 1902,
            'y': 1755
          },
          {
            'x': 1903,
            'y': 1798
          },
          {
            'x': 1891,
            'y': 1798
          }
        ]
      },
      'description': '0'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1921,
            'y': 1754
          },
          {
            'x': 1933,
            'y': 1754
          },
          {
            'x': 1934,
            'y': 1797
          },
          {
            'x': 1922,
            'y': 1797
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1947,
            'y': 1753
          },
          {
            'x': 1978,
            'y': 1752
          },
          {
            'x': 1979,
            'y': 1795
          },
          {
            'x': 1948,
            'y': 1796
          }
        ]
      },
      'description': '30'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': -53,
            'y': 2032
          },
          {
            'x': 57,
            'y': 1813
          },
          {
            'x': 141,
            'y': 1855
          },
          {
            'x': 31,
            'y': 2074
          }
        ]
      },
      'description': 'MORE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 60,
            'y': 1805
          },
          {
            'x': 72,
            'y': 1781
          },
          {
            'x': 156,
            'y': 1823
          },
          {
            'x': 144,
            'y': 1847
          }
        ]
      },
      'description': '?'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1330,
            'y': 1841
          },
          {
            'x': 1447,
            'y': 1841
          },
          {
            'x': 1447,
            'y': 1889
          },
          {
            'x': 1330,
            'y': 1889
          }
        ]
      },
      'description': 'Coles'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1796,
            'y': 1852
          },
          {
            'x': 1857,
            'y': 1852
          },
          {
            'x': 1857,
            'y': 1895
          },
          {
            'x': 1796,
            'y': 1895
          }
        ]
      },
      'description': 'QLD'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1891,
            'y': 1852
          },
          {
            'x': 1930,
            'y': 1852
          },
          {
            'x': 1930,
            'y': 1895
          },
          {
            'x': 1891,
            'y': 1895
          }
        ]
      },
      'description': 'AU'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1012,
            'y': 1883
          },
          {
            'x': 1049,
            'y': 1883
          },
          {
            'x': 1049,
            'y': 1933
          },
          {
            'x': 1012,
            'y': 1933
          }
        ]
      },
      'description': '06'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1065,
            'y': 1883
          },
          {
            'x': 1079,
            'y': 1883
          },
          {
            'x': 1079,
            'y': 1933
          },
          {
            'x': 1065,
            'y': 1933
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1079,
            'y': 1883
          },
          {
            'x': 1135,
            'y': 1883
          },
          {
            'x': 1135,
            'y': 1933
          },
          {
            'x': 1079,
            'y': 1933
          }
        ]
      },
      'description': '09'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1141,
            'y': 1883
          },
          {
            'x': 1155,
            'y': 1883
          },
          {
            'x': 1155,
            'y': 1933
          },
          {
            'x': 1141,
            'y': 1933
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1166,
            'y': 1883
          },
          {
            'x': 1202,
            'y': 1883
          },
          {
            'x': 1202,
            'y': 1933
          },
          {
            'x': 1166,
            'y': 1933
          }
        ]
      },
      'description': '19'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1237,
            'y': 1883
          },
          {
            'x': 1273,
            'y': 1883
          },
          {
            'x': 1273,
            'y': 1933
          },
          {
            'x': 1237,
            'y': 1933
          }
        ]
      },
      'description': '17'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1284,
            'y': 1883
          },
          {
            'x': 1298,
            'y': 1883
          },
          {
            'x': 1298,
            'y': 1933
          },
          {
            'x': 1284,
            'y': 1933
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1314,
            'y': 1883
          },
          {
            'x': 1343,
            'y': 1883
          },
          {
            'x': 1343,
            'y': 1933
          },
          {
            'x': 1314,
            'y': 1933
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1526,
            'y': 1892
          },
          {
            'x': 1721,
            'y': 1896
          },
          {
            'x': 1720,
            'y': 1945
          },
          {
            'x': 1525,
            'y': 1941
          }
        ]
      },
      'description': '46294971'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1789,
            'y': 1897
          },
          {
            'x': 1934,
            'y': 1900
          },
          {
            'x': 1933,
            'y': 1949
          },
          {
            'x': 1788,
            'y': 1946
          }
        ]
      },
      'description': 'NN71B8'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1011,
            'y': 1935
          },
          {
            'x': 1022,
            'y': 1935
          },
          {
            'x': 1022,
            'y': 1977
          },
          {
            'x': 1011,
            'y': 1977
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1037,
            'y': 1935
          },
          {
            'x': 1048,
            'y': 1935
          },
          {
            'x': 1048,
            'y': 1977
          },
          {
            'x': 1037,
            'y': 1977
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1063,
            'y': 1935
          },
          {
            'x': 1074,
            'y': 1935
          },
          {
            'x': 1074,
            'y': 1977
          },
          {
            'x': 1063,
            'y': 1977
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1084,
            'y': 1935
          },
          {
            'x': 1095,
            'y': 1935
          },
          {
            'x': 1095,
            'y': 1977
          },
          {
            'x': 1084,
            'y': 1977
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1110,
            'y': 1935
          },
          {
            'x': 1121,
            'y': 1935
          },
          {
            'x': 1121,
            'y': 1977
          },
          {
            'x': 1110,
            'y': 1977
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1152,
            'y': 1935
          },
          {
            'x': 1251,
            'y': 1935
          },
          {
            'x': 1251,
            'y': 1977
          },
          {
            'x': 1152,
            'y': 1977
          }
        ]
      },
      'description': '6049'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1839,
            'y': 1951
          },
          {
            'x': 1931,
            'y': 1951
          },
          {
            'x': 1931,
            'y': 1995
          },
          {
            'x': 1839,
            'y': 1995
          }
        ]
      },
      'description': 'VISA'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1004,
            'y': 1983
          },
          {
            'x': 1153,
            'y': 1983
          },
          {
            'x': 1153,
            'y': 2033
          },
          {
            'x': 1004,
            'y': 2033
          }
        ]
      },
      'description': 'CREDIT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1179,
            'y': 1983
          },
          {
            'x': 1347,
            'y': 1983
          },
          {
            'x': 1347,
            'y': 2033
          },
          {
            'x': 1179,
            'y': 2033
          }
        ]
      },
      'description': 'ACCOUNT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1568,
            'y': 1995
          },
          {
            'x': 1635,
            'y': 1996
          },
          {
            'x': 1634,
            'y': 2043
          },
          {
            'x': 1567,
            'y': 2042
          }
        ]
      },
      'description': 'HBL'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1669,
            'y': 1997
          },
          {
            'x': 1760,
            'y': 1999
          },
          {
            'x': 1759,
            'y': 2046
          },
          {
            'x': 1668,
            'y': 2044
          }
        ]
      },
      'description': 'Visa'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1789,
            'y': 1999
          },
          {
            'x': 1940,
            'y': 2002
          },
          {
            'x': 1939,
            'y': 2050
          },
          {
            'x': 1788,
            'y': 2047
          }
        ]
      },
      'description': 'Credit'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1006,
            'y': 2033
          },
          {
            'x': 1100,
            'y': 2035
          },
          {
            'x': 1099,
            'y': 2082
          },
          {
            'x': 1005,
            'y': 2080
          }
        ]
      },
      'description': 'APSN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1128,
            'y': 2035
          },
          {
            'x': 1222,
            'y': 2037
          },
          {
            'x': 1221,
            'y': 2084
          },
          {
            'x': 1127,
            'y': 2082
          }
        ]
      },
      'description': '0000'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1278,
            'y': 2038
          },
          {
            'x': 1343,
            'y': 2039
          },
          {
            'x': 1342,
            'y': 2085
          },
          {
            'x': 1277,
            'y': 2084
          }
        ]
      },
      'description': 'ATC'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1377,
            'y': 2039
          },
          {
            'x': 1466,
            'y': 2041
          },
          {
            'x': 1465,
            'y': 2088
          },
          {
            'x': 1376,
            'y': 2086
          }
        ]
      },
      'description': '0098'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1595,
            'y': 2045
          },
          {
            'x': 1933,
            'y': 2051
          },
          {
            'x': 1932,
            'y': 2098
          },
          {
            'x': 1594,
            'y': 2092
          }
        ]
      },
      'description': 'A0000000031010'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 999,
            'y': 2087
          },
          {
            'x': 1194,
            'y': 2087
          },
          {
            'x': 1194,
            'y': 2131
          },
          {
            'x': 999,
            'y': 2131
          }
        ]
      },
      'description': 'PURCHASE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1695,
            'y': 2098
          },
          {
            'x': 1761,
            'y': 2098
          },
          {
            'x': 1761,
            'y': 2144
          },
          {
            'x': 1695,
            'y': 2144
          }
        ]
      },
      'description': 'AUD'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1766,
            'y': 2098
          },
          {
            'x': 1779,
            'y': 2098
          },
          {
            'x': 1779,
            'y': 2144
          },
          {
            'x': 1766,
            'y': 2144
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1817,
            'y': 2098
          },
          {
            'x': 1851,
            'y': 2098
          },
          {
            'x': 1851,
            'y': 2144
          },
          {
            'x': 1817,
            'y': 2144
          }
        ]
      },
      'description': '26'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1870,
            'y': 2098
          },
          {
            'x': 1883,
            'y': 2098
          },
          {
            'x': 1883,
            'y': 2144
          },
          {
            'x': 1870,
            'y': 2144
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1884,
            'y': 2098
          },
          {
            'x': 1934,
            'y': 2098
          },
          {
            'x': 1934,
            'y': 2144
          },
          {
            'x': 1884,
            'y': 2144
          }
        ]
      },
      'description': '64'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 998,
            'y': 2135
          },
          {
            'x': 1071,
            'y': 2135
          },
          {
            'x': 1071,
            'y': 2185
          },
          {
            'x': 998,
            'y': 2185
          }
        ]
      },
      'description': 'RRN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1100,
            'y': 2135
          },
          {
            'x': 1392,
            'y': 2135
          },
          {
            'x': 1392,
            'y': 2185
          },
          {
            'x': 1100,
            'y': 2185
          }
        ]
      },
      'description': '001180100500'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1648,
            'y': 2151
          },
          {
            'x': 1660,
            'y': 2151
          },
          {
            'x': 1660,
            'y': 2195
          },
          {
            'x': 1648,
            'y': 2195
          }
        ]
      },
      'description': '('
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1662,
            'y': 2151
          },
          {
            'x': 1710,
            'y': 2151
          },
          {
            'x': 1710,
            'y': 2195
          },
          {
            'x': 1662,
            'y': 2195
          }
        ]
      },
      'description': '00'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1716,
            'y': 2151
          },
          {
            'x': 1728,
            'y': 2151
          },
          {
            'x': 1728,
            'y': 2195
          },
          {
            'x': 1716,
            'y': 2195
          }
        ]
      },
      'description': ')'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1740,
            'y': 2151
          },
          {
            'x': 1931,
            'y': 2151
          },
          {
            'x': 1931,
            'y': 2195
          },
          {
            'x': 1740,
            'y': 2195
          }
        ]
      },
      'description': 'APPROVED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 998,
            'y': 2183
          },
          {
            'x': 1093,
            'y': 2183
          },
          {
            'x': 1093,
            'y': 2236
          },
          {
            'x': 998,
            'y': 2236
          }
        ]
      },
      'description': 'AUTH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1122,
            'y': 2183
          },
          {
            'x': 1265,
            'y': 2183
          },
          {
            'x': 1265,
            'y': 2236
          },
          {
            'x': 1122,
            'y': 2236
          }
        ]
      },
      'description': '572984'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 999,
            'y': 2237
          },
          {
            'x': 1041,
            'y': 2238
          },
          {
            'x': 1040,
            'y': 2285
          },
          {
            'x': 998,
            'y': 2284
          }
        ]
      },
      'description': 'NO'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1072,
            'y': 2238
          },
          {
            'x': 1137,
            'y': 2239
          },
          {
            'x': 1136,
            'y': 2286
          },
          {
            'x': 1071,
            'y': 2285
          }
        ]
      },
      'description': 'PIN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1172,
            'y': 2240
          },
          {
            'x': 1215,
            'y': 2241
          },
          {
            'x': 1214,
            'y': 2287
          },
          {
            'x': 1171,
            'y': 2286
          }
        ]
      },
      'description': 'OR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1246,
            'y': 2241
          },
          {
            'x': 1459,
            'y': 2244
          },
          {
            'x': 1458,
            'y': 2290
          },
          {
            'x': 1245,
            'y': 2287
          }
        ]
      },
      'description': 'SIGNATURE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1492,
            'y': 2244
          },
          {
            'x': 1687,
            'y': 2247
          },
          {
            'x': 1686,
            'y': 2294
          },
          {
            'x': 1491,
            'y': 2291
          }
        ]
      },
      'description': 'REQUIRED'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1121,
            'y': 2445
          },
          {
            'x': 1285,
            'y': 2448
          },
          {
            'x': 1284,
            'y': 2495
          },
          {
            'x': 1120,
            'y': 2492
          }
        ]
      },
      'description': 'flybuys'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1311,
            'y': 2448
          },
          {
            'x': 1413,
            'y': 2450
          },
          {
            'x': 1412,
            'y': 2497
          },
          {
            'x': 1310,
            'y': 2495
          }
        ]
      },
      'description': 'Card'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1440,
            'y': 2450
          },
          {
            'x': 1482,
            'y': 2451
          },
          {
            'x': 1481,
            'y': 2498
          },
          {
            'x': 1439,
            'y': 2497
          }
        ]
      },
      'description': 'NO'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1494,
            'y': 2451
          },
          {
            'x': 1507,
            'y': 2451
          },
          {
            'x': 1506,
            'y': 2497
          },
          {
            'x': 1493,
            'y': 2497
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1545,
            'y': 2452
          },
          {
            'x': 1610,
            'y': 2453
          },
          {
            'x': 1609,
            'y': 2499
          },
          {
            'x': 1544,
            'y': 2498
          }
        ]
      },
      'description': '279'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1617,
            'y': 2453
          },
          {
            'x': 1630,
            'y': 2453
          },
          {
            'x': 1629,
            'y': 2499
          },
          {
            'x': 1616,
            'y': 2499
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1640,
            'y': 2454
          },
          {
            'x': 1653,
            'y': 2454
          },
          {
            'x': 1652,
            'y': 2500
          },
          {
            'x': 1639,
            'y': 2500
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1664,
            'y': 2454
          },
          {
            'x': 1677,
            'y': 2454
          },
          {
            'x': 1676,
            'y': 2500
          },
          {
            'x': 1663,
            'y': 2500
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1692,
            'y': 2454
          },
          {
            'x': 1705,
            'y': 2454
          },
          {
            'x': 1704,
            'y': 2500
          },
          {
            'x': 1691,
            'y': 2500
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1715,
            'y': 2455
          },
          {
            'x': 1728,
            'y': 2455
          },
          {
            'x': 1727,
            'y': 2501
          },
          {
            'x': 1714,
            'y': 2501
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1739,
            'y': 2455
          },
          {
            'x': 1752,
            'y': 2455
          },
          {
            'x': 1751,
            'y': 2501
          },
          {
            'x': 1738,
            'y': 2501
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1764,
            'y': 2456
          },
          {
            'x': 1858,
            'y': 2458
          },
          {
            'x': 1857,
            'y': 2503
          },
          {
            'x': 1763,
            'y': 2502
          }
        ]
      },
      'description': '7824'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1270,
            'y': 2500
          },
          {
            'x': 1283,
            'y': 2500
          },
          {
            'x': 1282,
            'y': 2546
          },
          {
            'x': 1269,
            'y': 2546
          }
        ]
      },
      'description': '%'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1317,
            'y': 2500
          },
          {
            'x': 1330,
            'y': 2500
          },
          {
            'x': 1329,
            'y': 2546
          },
          {
            'x': 1316,
            'y': 2546
          }
        ]
      },
      'description': '='
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1366,
            'y': 2501
          },
          {
            'x': 1535,
            'y': 2504
          },
          {
            'x': 1534,
            'y': 2551
          },
          {
            'x': 1365,
            'y': 2548
          }
        ]
      },
      'description': 'Taxable'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1568,
            'y': 2505
          },
          {
            'x': 1689,
            'y': 2507
          },
          {
            'x': 1688,
            'y': 2554
          },
          {
            'x': 1567,
            'y': 2552
          }
        ]
      },
      'description': 'items'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 993,
            'y': 2558
          },
          {
            'x': 998,
            'y': 2558
          },
          {
            'x': 998,
            'y': 2580
          },
          {
            'x': 993,
            'y': 2580
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1018,
            'y': 2559
          },
          {
            'x': 1023,
            'y': 2559
          },
          {
            'x': 1023,
            'y': 2581
          },
          {
            'x': 1018,
            'y': 2581
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1041,
            'y': 2559
          },
          {
            'x': 1046,
            'y': 2559
          },
          {
            'x': 1046,
            'y': 2581
          },
          {
            'x': 1041,
            'y': 2581
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1069,
            'y': 2560
          },
          {
            'x': 1074,
            'y': 2560
          },
          {
            'x': 1074,
            'y': 2582
          },
          {
            'x': 1069,
            'y': 2582
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1094,
            'y': 2560
          },
          {
            'x': 1099,
            'y': 2560
          },
          {
            'x': 1099,
            'y': 2582
          },
          {
            'x': 1094,
            'y': 2582
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1120,
            'y': 2561
          },
          {
            'x': 1125,
            'y': 2561
          },
          {
            'x': 1125,
            'y': 2583
          },
          {
            'x': 1120,
            'y': 2583
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1143,
            'y': 2561
          },
          {
            'x': 1148,
            'y': 2561
          },
          {
            'x': 1148,
            'y': 2583
          },
          {
            'x': 1143,
            'y': 2583
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1193,
            'y': 2562
          },
          {
            'x': 1198,
            'y': 2562
          },
          {
            'x': 1198,
            'y': 2584
          },
          {
            'x': 1193,
            'y': 2584
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1218,
            'y': 2563
          },
          {
            'x': 1223,
            'y': 2563
          },
          {
            'x': 1223,
            'y': 2585
          },
          {
            'x': 1218,
            'y': 2585
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1244,
            'y': 2563
          },
          {
            'x': 1249,
            'y': 2563
          },
          {
            'x': 1249,
            'y': 2585
          },
          {
            'x': 1244,
            'y': 2585
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1269,
            'y': 2564
          },
          {
            'x': 1274,
            'y': 2564
          },
          {
            'x': 1274,
            'y': 2586
          },
          {
            'x': 1269,
            'y': 2586
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1294,
            'y': 2564
          },
          {
            'x': 1299,
            'y': 2564
          },
          {
            'x': 1299,
            'y': 2586
          },
          {
            'x': 1294,
            'y': 2586
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1320,
            'y': 2565
          },
          {
            'x': 1325,
            'y': 2565
          },
          {
            'x': 1325,
            'y': 2587
          },
          {
            'x': 1320,
            'y': 2587
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1343,
            'y': 2565
          },
          {
            'x': 1348,
            'y': 2565
          },
          {
            'x': 1348,
            'y': 2587
          },
          {
            'x': 1343,
            'y': 2587
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1368,
            'y': 2566
          },
          {
            'x': 1373,
            'y': 2566
          },
          {
            'x': 1373,
            'y': 2588
          },
          {
            'x': 1368,
            'y': 2588
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1393,
            'y': 2566
          },
          {
            'x': 1398,
            'y': 2566
          },
          {
            'x': 1398,
            'y': 2588
          },
          {
            'x': 1393,
            'y': 2588
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1419,
            'y': 2567
          },
          {
            'x': 1424,
            'y': 2567
          },
          {
            'x': 1424,
            'y': 2589
          },
          {
            'x': 1419,
            'y': 2589
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1444,
            'y': 2567
          },
          {
            'x': 1449,
            'y': 2567
          },
          {
            'x': 1449,
            'y': 2589
          },
          {
            'x': 1444,
            'y': 2589
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1469,
            'y': 2568
          },
          {
            'x': 1474,
            'y': 2568
          },
          {
            'x': 1474,
            'y': 2590
          },
          {
            'x': 1469,
            'y': 2590
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1492,
            'y': 2568
          },
          {
            'x': 1497,
            'y': 2568
          },
          {
            'x': 1497,
            'y': 2590
          },
          {
            'x': 1492,
            'y': 2590
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1518,
            'y': 2568
          },
          {
            'x': 1523,
            'y': 2568
          },
          {
            'x': 1523,
            'y': 2590
          },
          {
            'x': 1518,
            'y': 2590
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1543,
            'y': 2569
          },
          {
            'x': 1548,
            'y': 2569
          },
          {
            'x': 1548,
            'y': 2591
          },
          {
            'x': 1543,
            'y': 2591
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1568,
            'y': 2569
          },
          {
            'x': 1573,
            'y': 2569
          },
          {
            'x': 1573,
            'y': 2591
          },
          {
            'x': 1568,
            'y': 2591
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1593,
            'y': 2570
          },
          {
            'x': 1598,
            'y': 2570
          },
          {
            'x': 1598,
            'y': 2592
          },
          {
            'x': 1593,
            'y': 2592
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1619,
            'y': 2570
          },
          {
            'x': 1624,
            'y': 2570
          },
          {
            'x': 1624,
            'y': 2592
          },
          {
            'x': 1619,
            'y': 2592
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1642,
            'y': 2571
          },
          {
            'x': 1647,
            'y': 2571
          },
          {
            'x': 1647,
            'y': 2593
          },
          {
            'x': 1642,
            'y': 2593
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1667,
            'y': 2571
          },
          {
            'x': 1672,
            'y': 2571
          },
          {
            'x': 1672,
            'y': 2593
          },
          {
            'x': 1667,
            'y': 2593
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1692,
            'y': 2572
          },
          {
            'x': 1697,
            'y': 2572
          },
          {
            'x': 1697,
            'y': 2594
          },
          {
            'x': 1692,
            'y': 2594
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1718,
            'y': 2572
          },
          {
            'x': 1723,
            'y': 2572
          },
          {
            'x': 1723,
            'y': 2594
          },
          {
            'x': 1718,
            'y': 2594
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1743,
            'y': 2573
          },
          {
            'x': 1748,
            'y': 2573
          },
          {
            'x': 1748,
            'y': 2595
          },
          {
            'x': 1743,
            'y': 2595
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1768,
            'y': 2573
          },
          {
            'x': 1773,
            'y': 2573
          },
          {
            'x': 1773,
            'y': 2595
          },
          {
            'x': 1768,
            'y': 2595
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1794,
            'y': 2574
          },
          {
            'x': 1799,
            'y': 2574
          },
          {
            'x': 1799,
            'y': 2596
          },
          {
            'x': 1794,
            'y': 2596
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1819,
            'y': 2574
          },
          {
            'x': 1824,
            'y': 2574
          },
          {
            'x': 1824,
            'y': 2596
          },
          {
            'x': 1819,
            'y': 2596
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1844,
            'y': 2575
          },
          {
            'x': 1849,
            'y': 2575
          },
          {
            'x': 1849,
            'y': 2597
          },
          {
            'x': 1844,
            'y': 2597
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1869,
            'y': 2575
          },
          {
            'x': 1874,
            'y': 2575
          },
          {
            'x': 1874,
            'y': 2597
          },
          {
            'x': 1869,
            'y': 2597
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1895,
            'y': 2576
          },
          {
            'x': 1900,
            'y': 2576
          },
          {
            'x': 1900,
            'y': 2598
          },
          {
            'x': 1895,
            'y': 2598
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1920,
            'y': 2576
          },
          {
            'x': 1925,
            'y': 2576
          },
          {
            'x': 1925,
            'y': 2598
          },
          {
            'x': 1920,
            'y': 2598
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1943,
            'y': 2577
          },
          {
            'x': 1948,
            'y': 2577
          },
          {
            'x': 1948,
            'y': 2599
          },
          {
            'x': 1943,
            'y': 2599
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1971,
            'y': 2577
          },
          {
            'x': 1976,
            'y': 2577
          },
          {
            'x': 1976,
            'y': 2599
          },
          {
            'x': 1971,
            'y': 2599
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1996,
            'y': 2578
          },
          {
            'x': 2001,
            'y': 2578
          },
          {
            'x': 2001,
            'y': 2600
          },
          {
            'x': 1996,
            'y': 2600
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 997,
            'y': 2606
          },
          {
            'x': 1181,
            'y': 2610
          },
          {
            'x': 1179,
            'y': 2698
          },
          {
            'x': 995,
            'y': 2694
          }
        ]
      },
      'description': 'Total'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1217,
            'y': 2611
          },
          {
            'x': 1480,
            'y': 2617
          },
          {
            'x': 1478,
            'y': 2705
          },
          {
            'x': 1215,
            'y': 2699
          }
        ]
      },
      'description': 'Savings'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1844,
            'y': 2621
          },
          {
            'x': 1869,
            'y': 2621
          },
          {
            'x': 1869,
            'y': 2709
          },
          {
            'x': 1844,
            'y': 2709
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1888,
            'y': 2621
          },
          {
            'x': 1913,
            'y': 2621
          },
          {
            'x': 1913,
            'y': 2709
          },
          {
            'x': 1888,
            'y': 2709
          }
        ]
      },
      'description': '1'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1915,
            'y': 2621
          },
          {
            'x': 1940,
            'y': 2621
          },
          {
            'x': 1940,
            'y': 2709
          },
          {
            'x': 1915,
            'y': 2709
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1958,
            'y': 2621
          },
          {
            'x': 2022,
            'y': 2621
          },
          {
            'x': 2022,
            'y': 2709
          },
          {
            'x': 1958,
            'y': 2709
          }
        ]
      },
      'description': '90'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 986,
            'y': 2714
          },
          {
            'x': 991,
            'y': 2714
          },
          {
            'x': 991,
            'y': 2736
          },
          {
            'x': 986,
            'y': 2736
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1014,
            'y': 2715
          },
          {
            'x': 1019,
            'y': 2715
          },
          {
            'x': 1019,
            'y': 2737
          },
          {
            'x': 1014,
            'y': 2737
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1037,
            'y': 2715
          },
          {
            'x': 1042,
            'y': 2715
          },
          {
            'x': 1042,
            'y': 2737
          },
          {
            'x': 1037,
            'y': 2737
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1064,
            'y': 2716
          },
          {
            'x': 1069,
            'y': 2716
          },
          {
            'x': 1069,
            'y': 2738
          },
          {
            'x': 1064,
            'y': 2738
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1165,
            'y': 2718
          },
          {
            'x': 1170,
            'y': 2718
          },
          {
            'x': 1170,
            'y': 2740
          },
          {
            'x': 1165,
            'y': 2740
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1188,
            'y': 2719
          },
          {
            'x': 1193,
            'y': 2719
          },
          {
            'x': 1193,
            'y': 2741
          },
          {
            'x': 1188,
            'y': 2741
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1214,
            'y': 2719
          },
          {
            'x': 1219,
            'y': 2719
          },
          {
            'x': 1219,
            'y': 2741
          },
          {
            'x': 1214,
            'y': 2741
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1239,
            'y': 2720
          },
          {
            'x': 1244,
            'y': 2720
          },
          {
            'x': 1244,
            'y': 2742
          },
          {
            'x': 1239,
            'y': 2742
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1264,
            'y': 2720
          },
          {
            'x': 1269,
            'y': 2720
          },
          {
            'x': 1269,
            'y': 2742
          },
          {
            'x': 1264,
            'y': 2742
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1290,
            'y': 2721
          },
          {
            'x': 1295,
            'y': 2721
          },
          {
            'x': 1295,
            'y': 2743
          },
          {
            'x': 1290,
            'y': 2743
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1315,
            'y': 2721
          },
          {
            'x': 1320,
            'y': 2721
          },
          {
            'x': 1320,
            'y': 2743
          },
          {
            'x': 1315,
            'y': 2743
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1340,
            'y': 2722
          },
          {
            'x': 1345,
            'y': 2722
          },
          {
            'x': 1345,
            'y': 2744
          },
          {
            'x': 1340,
            'y': 2744
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1363,
            'y': 2722
          },
          {
            'x': 1368,
            'y': 2722
          },
          {
            'x': 1368,
            'y': 2744
          },
          {
            'x': 1363,
            'y': 2744
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1391,
            'y': 2723
          },
          {
            'x': 1396,
            'y': 2723
          },
          {
            'x': 1396,
            'y': 2745
          },
          {
            'x': 1391,
            'y': 2745
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1416,
            'y': 2723
          },
          {
            'x': 1421,
            'y': 2723
          },
          {
            'x': 1421,
            'y': 2745
          },
          {
            'x': 1416,
            'y': 2745
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1441,
            'y': 2724
          },
          {
            'x': 1446,
            'y': 2724
          },
          {
            'x': 1446,
            'y': 2746
          },
          {
            'x': 1441,
            'y': 2746
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1467,
            'y': 2725
          },
          {
            'x': 1472,
            'y': 2725
          },
          {
            'x': 1472,
            'y': 2747
          },
          {
            'x': 1467,
            'y': 2747
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1490,
            'y': 2725
          },
          {
            'x': 1495,
            'y': 2725
          },
          {
            'x': 1495,
            'y': 2747
          },
          {
            'x': 1490,
            'y': 2747
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1515,
            'y': 2726
          },
          {
            'x': 1520,
            'y': 2726
          },
          {
            'x': 1520,
            'y': 2748
          },
          {
            'x': 1515,
            'y': 2748
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1540,
            'y': 2726
          },
          {
            'x': 1545,
            'y': 2726
          },
          {
            'x': 1545,
            'y': 2748
          },
          {
            'x': 1540,
            'y': 2748
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1566,
            'y': 2727
          },
          {
            'x': 1571,
            'y': 2727
          },
          {
            'x': 1571,
            'y': 2749
          },
          {
            'x': 1566,
            'y': 2749
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1591,
            'y': 2727
          },
          {
            'x': 1596,
            'y': 2727
          },
          {
            'x': 1596,
            'y': 2749
          },
          {
            'x': 1591,
            'y': 2749
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1614,
            'y': 2728
          },
          {
            'x': 1619,
            'y': 2728
          },
          {
            'x': 1619,
            'y': 2750
          },
          {
            'x': 1614,
            'y': 2750
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1642,
            'y': 2728
          },
          {
            'x': 1647,
            'y': 2728
          },
          {
            'x': 1647,
            'y': 2750
          },
          {
            'x': 1642,
            'y': 2750
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1667,
            'y': 2729
          },
          {
            'x': 1672,
            'y': 2729
          },
          {
            'x': 1672,
            'y': 2751
          },
          {
            'x': 1667,
            'y': 2751
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1692,
            'y': 2729
          },
          {
            'x': 1697,
            'y': 2729
          },
          {
            'x': 1697,
            'y': 2751
          },
          {
            'x': 1692,
            'y': 2751
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1718,
            'y': 2730
          },
          {
            'x': 1723,
            'y': 2730
          },
          {
            'x': 1723,
            'y': 2752
          },
          {
            'x': 1718,
            'y': 2752
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1743,
            'y': 2730
          },
          {
            'x': 1748,
            'y': 2730
          },
          {
            'x': 1748,
            'y': 2752
          },
          {
            'x': 1743,
            'y': 2752
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1766,
            'y': 2731
          },
          {
            'x': 1771,
            'y': 2731
          },
          {
            'x': 1771,
            'y': 2753
          },
          {
            'x': 1766,
            'y': 2753
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1793,
            'y': 2731
          },
          {
            'x': 1798,
            'y': 2731
          },
          {
            'x': 1798,
            'y': 2753
          },
          {
            'x': 1793,
            'y': 2753
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1819,
            'y': 2732
          },
          {
            'x': 1824,
            'y': 2732
          },
          {
            'x': 1824,
            'y': 2754
          },
          {
            'x': 1819,
            'y': 2754
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1869,
            'y': 2733
          },
          {
            'x': 1874,
            'y': 2733
          },
          {
            'x': 1874,
            'y': 2755
          },
          {
            'x': 1869,
            'y': 2755
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1895,
            'y': 2734
          },
          {
            'x': 1900,
            'y': 2734
          },
          {
            'x': 1900,
            'y': 2756
          },
          {
            'x': 1895,
            'y': 2756
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1918,
            'y': 2734
          },
          {
            'x': 1923,
            'y': 2734
          },
          {
            'x': 1923,
            'y': 2756
          },
          {
            'x': 1918,
            'y': 2756
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1945,
            'y': 2735
          },
          {
            'x': 1950,
            'y': 2735
          },
          {
            'x': 1950,
            'y': 2757
          },
          {
            'x': 1945,
            'y': 2757
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1970,
            'y': 2735
          },
          {
            'x': 1975,
            'y': 2735
          },
          {
            'x': 1975,
            'y': 2757
          },
          {
            'x': 1970,
            'y': 2757
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1996,
            'y': 2736
          },
          {
            'x': 2001,
            'y': 2736
          },
          {
            'x': 2001,
            'y': 2758
          },
          {
            'x': 1996,
            'y': 2758
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1058,
            'y': 2755
          },
          {
            'x': 1181,
            'y': 2758
          },
          {
            'x': 1180,
            'y': 2805
          },
          {
            'x': 1057,
            'y': 2802
          }
        ]
      },
      'description': 'Total'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1208,
            'y': 2759
          },
          {
            'x': 1377,
            'y': 2763
          },
          {
            'x': 1376,
            'y': 2810
          },
          {
            'x': 1207,
            'y': 2806
          }
        ]
      },
      'description': 'Savings'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1410,
            'y': 2764
          },
          {
            'x': 1581,
            'y': 2768
          },
          {
            'x': 1580,
            'y': 2815
          },
          {
            'x': 1409,
            'y': 2811
          }
        ]
      },
      'description': 'include'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1614,
            'y': 2769
          },
          {
            'x': 1679,
            'y': 2771
          },
          {
            'x': 1678,
            'y': 2817
          },
          {
            'x': 1613,
            'y': 2815
          }
        ]
      },
      'description': 'any'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1711,
            'y': 2771
          },
          {
            'x': 1990,
            'y': 2778
          },
          {
            'x': 1989,
            'y': 2824
          },
          {
            'x': 1710,
            'y': 2817
          }
        ]
      },
      'description': 'Promotional'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1256,
            'y': 2814
          },
          {
            'x': 1328,
            'y': 2816
          },
          {
            'x': 1327,
            'y': 2862
          },
          {
            'x': 1255,
            'y': 2860
          }
        ]
      },
      'description': 'and'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1353,
            'y': 2815
          },
          {
            'x': 1528,
            'y': 2819
          },
          {
            'x': 1527,
            'y': 2866
          },
          {
            'x': 1352,
            'y': 2862
          }
        ]
      },
      'description': 'Loyalty'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1553,
            'y': 2820
          },
          {
            'x': 1781,
            'y': 2825
          },
          {
            'x': 1780,
            'y': 2871
          },
          {
            'x': 1552,
            'y': 2866
          }
        ]
      },
      'description': 'Discounts'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1794,
            'y': 2825
          },
          {
            'x': 1807,
            'y': 2825
          },
          {
            'x': 1806,
            'y': 2871
          },
          {
            'x': 1793,
            'y': 2871
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1003,
            'y': 2861
          },
          {
            'x': 1176,
            'y': 2864
          },
          {
            'x': 1175,
            'y': 2911
          },
          {
            'x': 1002,
            'y': 2908
          }
        ]
      },
      'description': 'flybuys'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1200,
            'y': 2865
          },
          {
            'x': 1345,
            'y': 2867
          },
          {
            'x': 1344,
            'y': 2913
          },
          {
            'x': 1199,
            'y': 2911
          }
        ]
      },
      'description': 'points'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1378,
            'y': 2868
          },
          {
            'x': 1429,
            'y': 2869
          },
          {
            'x': 1428,
            'y': 2915
          },
          {
            'x': 1377,
            'y': 2914
          }
        ]
      },
      'description': 'as'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1454,
            'y': 2869
          },
          {
            'x': 1505,
            'y': 2870
          },
          {
            'x': 1504,
            'y': 2917
          },
          {
            'x': 1453,
            'y': 2916
          }
        ]
      },
      'description': 'of'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1529,
            'y': 2870
          },
          {
            'x': 1758,
            'y': 2874
          },
          {
            'x': 1757,
            'y': 2921
          },
          {
            'x': 1528,
            'y': 2917
          }
        ]
      },
      'description': 'yesterday'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1769,
            'y': 2874
          },
          {
            'x': 1782,
            'y': 2874
          },
          {
            'x': 1781,
            'y': 2920
          },
          {
            'x': 1768,
            'y': 2920
          }
        ]
      },
      'description': ':'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1813,
            'y': 2875
          },
          {
            'x': 1936,
            'y': 2877
          },
          {
            'x': 1935,
            'y': 2923
          },
          {
            'x': 1812,
            'y': 2921
          }
        ]
      },
      'description': '55642'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1228,
            'y': 3170
          },
          {
            'x': 1724,
            'y': 3181
          },
          {
            'x': 1723,
            'y': 3240
          },
          {
            'x': 1227,
            'y': 3229
          }
        ]
      },
      'description': '10609194571118100500'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1044,
            'y': 3222
          },
          {
            'x': 1053,
            'y': 3222
          },
          {
            'x': 1052,
            'y': 3257
          },
          {
            'x': 1043,
            'y': 3257
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1069,
            'y': 3223
          },
          {
            'x': 1078,
            'y': 3223
          },
          {
            'x': 1077,
            'y': 3258
          },
          {
            'x': 1068,
            'y': 3258
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1091,
            'y': 3223
          },
          {
            'x': 1100,
            'y': 3223
          },
          {
            'x': 1099,
            'y': 3258
          },
          {
            'x': 1090,
            'y': 3258
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1114,
            'y': 3224
          },
          {
            'x': 1123,
            'y': 3224
          },
          {
            'x': 1122,
            'y': 3259
          },
          {
            'x': 1113,
            'y': 3259
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1136,
            'y': 3224
          },
          {
            'x': 1145,
            'y': 3224
          },
          {
            'x': 1144,
            'y': 3259
          },
          {
            'x': 1135,
            'y': 3259
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1159,
            'y': 3225
          },
          {
            'x': 1168,
            'y': 3225
          },
          {
            'x': 1167,
            'y': 3260
          },
          {
            'x': 1158,
            'y': 3260
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1183,
            'y': 3226
          },
          {
            'x': 1192,
            'y': 3226
          },
          {
            'x': 1191,
            'y': 3261
          },
          {
            'x': 1182,
            'y': 3261
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1206,
            'y': 3226
          },
          {
            'x': 1215,
            'y': 3226
          },
          {
            'x': 1214,
            'y': 3261
          },
          {
            'x': 1205,
            'y': 3261
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1227,
            'y': 3227
          },
          {
            'x': 1236,
            'y': 3227
          },
          {
            'x': 1235,
            'y': 3262
          },
          {
            'x': 1226,
            'y': 3262
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1253,
            'y': 3227
          },
          {
            'x': 1262,
            'y': 3227
          },
          {
            'x': 1261,
            'y': 3262
          },
          {
            'x': 1252,
            'y': 3262
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1274,
            'y': 3228
          },
          {
            'x': 1283,
            'y': 3228
          },
          {
            'x': 1282,
            'y': 3263
          },
          {
            'x': 1273,
            'y': 3263
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1299,
            'y': 3229
          },
          {
            'x': 1308,
            'y': 3229
          },
          {
            'x': 1307,
            'y': 3264
          },
          {
            'x': 1298,
            'y': 3264
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1321,
            'y': 3229
          },
          {
            'x': 1330,
            'y': 3229
          },
          {
            'x': 1329,
            'y': 3264
          },
          {
            'x': 1320,
            'y': 3264
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1343,
            'y': 3230
          },
          {
            'x': 1352,
            'y': 3230
          },
          {
            'x': 1351,
            'y': 3265
          },
          {
            'x': 1342,
            'y': 3265
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1368,
            'y': 3230
          },
          {
            'x': 1377,
            'y': 3230
          },
          {
            'x': 1376,
            'y': 3265
          },
          {
            'x': 1367,
            'y': 3265
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1389,
            'y': 3231
          },
          {
            'x': 1398,
            'y': 3231
          },
          {
            'x': 1397,
            'y': 3266
          },
          {
            'x': 1388,
            'y': 3266
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1415,
            'y': 3231
          },
          {
            'x': 1424,
            'y': 3231
          },
          {
            'x': 1423,
            'y': 3266
          },
          {
            'x': 1414,
            'y': 3266
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1436,
            'y': 3232
          },
          {
            'x': 1445,
            'y': 3232
          },
          {
            'x': 1444,
            'y': 3267
          },
          {
            'x': 1435,
            'y': 3267
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1461,
            'y': 3233
          },
          {
            'x': 1470,
            'y': 3233
          },
          {
            'x': 1469,
            'y': 3268
          },
          {
            'x': 1460,
            'y': 3268
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1483,
            'y': 3233
          },
          {
            'x': 1492,
            'y': 3233
          },
          {
            'x': 1491,
            'y': 3268
          },
          {
            'x': 1482,
            'y': 3268
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1505,
            'y': 3234
          },
          {
            'x': 1514,
            'y': 3234
          },
          {
            'x': 1513,
            'y': 3269
          },
          {
            'x': 1504,
            'y': 3269
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1530,
            'y': 3234
          },
          {
            'x': 1539,
            'y': 3234
          },
          {
            'x': 1538,
            'y': 3269
          },
          {
            'x': 1529,
            'y': 3269
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1551,
            'y': 3235
          },
          {
            'x': 1560,
            'y': 3235
          },
          {
            'x': 1559,
            'y': 3270
          },
          {
            'x': 1550,
            'y': 3270
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1575,
            'y': 3235
          },
          {
            'x': 1584,
            'y': 3235
          },
          {
            'x': 1583,
            'y': 3270
          },
          {
            'x': 1574,
            'y': 3270
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1598,
            'y': 3236
          },
          {
            'x': 1607,
            'y': 3236
          },
          {
            'x': 1606,
            'y': 3271
          },
          {
            'x': 1597,
            'y': 3271
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1620,
            'y': 3236
          },
          {
            'x': 1629,
            'y': 3236
          },
          {
            'x': 1628,
            'y': 3271
          },
          {
            'x': 1619,
            'y': 3271
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1645,
            'y': 3237
          },
          {
            'x': 1654,
            'y': 3237
          },
          {
            'x': 1653,
            'y': 3272
          },
          {
            'x': 1644,
            'y': 3272
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1667,
            'y': 3238
          },
          {
            'x': 1676,
            'y': 3238
          },
          {
            'x': 1675,
            'y': 3273
          },
          {
            'x': 1666,
            'y': 3273
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1692,
            'y': 3238
          },
          {
            'x': 1701,
            'y': 3238
          },
          {
            'x': 1700,
            'y': 3273
          },
          {
            'x': 1691,
            'y': 3273
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1717,
            'y': 3239
          },
          {
            'x': 1726,
            'y': 3239
          },
          {
            'x': 1725,
            'y': 3274
          },
          {
            'x': 1716,
            'y': 3274
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1739,
            'y': 3239
          },
          {
            'x': 1748,
            'y': 3239
          },
          {
            'x': 1747,
            'y': 3274
          },
          {
            'x': 1738,
            'y': 3274
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1760,
            'y': 3240
          },
          {
            'x': 1769,
            'y': 3240
          },
          {
            'x': 1768,
            'y': 3275
          },
          {
            'x': 1759,
            'y': 3275
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1785,
            'y': 3241
          },
          {
            'x': 1794,
            'y': 3241
          },
          {
            'x': 1793,
            'y': 3276
          },
          {
            'x': 1784,
            'y': 3276
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1807,
            'y': 3241
          },
          {
            'x': 1816,
            'y': 3241
          },
          {
            'x': 1815,
            'y': 3276
          },
          {
            'x': 1806,
            'y': 3276
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1829,
            'y': 3242
          },
          {
            'x': 1838,
            'y': 3242
          },
          {
            'x': 1837,
            'y': 3277
          },
          {
            'x': 1828,
            'y': 3277
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1854,
            'y': 3242
          },
          {
            'x': 1863,
            'y': 3242
          },
          {
            'x': 1862,
            'y': 3277
          },
          {
            'x': 1853,
            'y': 3277
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1877,
            'y': 3243
          },
          {
            'x': 1886,
            'y': 3243
          },
          {
            'x': 1885,
            'y': 3278
          },
          {
            'x': 1876,
            'y': 3278
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1901,
            'y': 3243
          },
          {
            'x': 1910,
            'y': 3243
          },
          {
            'x': 1909,
            'y': 3278
          },
          {
            'x': 1900,
            'y': 3278
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1926,
            'y': 3244
          },
          {
            'x': 1935,
            'y': 3244
          },
          {
            'x': 1934,
            'y': 3279
          },
          {
            'x': 1925,
            'y': 3279
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1947,
            'y': 3245
          },
          {
            'x': 1956,
            'y': 3245
          },
          {
            'x': 1955,
            'y': 3280
          },
          {
            'x': 1946,
            'y': 3280
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1971,
            'y': 3245
          },
          {
            'x': 1980,
            'y': 3245
          },
          {
            'x': 1979,
            'y': 3280
          },
          {
            'x': 1970,
            'y': 3280
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1994,
            'y': 3246
          },
          {
            'x': 2003,
            'y': 3246
          },
          {
            'x': 2002,
            'y': 3281
          },
          {
            'x': 1993,
            'y': 3281
          }
        ]
      },
      'description': '*'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1044,
            'y': 3267
          },
          {
            'x': 1049,
            'y': 3267
          },
          {
            'x': 1048,
            'y': 3289
          },
          {
            'x': 1043,
            'y': 3289
          }
        ]
      },
      'description': 'D'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1054,
            'y': 3268
          },
          {
            'x': 1059,
            'y': 3268
          },
          {
            'x': 1058,
            'y': 3290
          },
          {
            'x': 1053,
            'y': 3290
          }
        ]
      },
      'description': ''
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1059,
            'y': 3267
          },
          {
            'x': 1093,
            'y': 3268
          },
          {
            'x': 1092,
            'y': 3291
          },
          {
            'x': 1058,
            'y': 3290
          }
        ]
      },
      'description': 'ARE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1100,
            'y': 3269
          },
          {
            'x': 1150,
            'y': 3270
          },
          {
            'x': 1149,
            'y': 3292
          },
          {
            'x': 1099,
            'y': 3291
          }
        ]
      },
      'description': 'OERG'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1158,
            'y': 3270
          },
          {
            'x': 1218,
            'y': 3272
          },
          {
            'x': 1217,
            'y': 3295
          },
          {
            'x': 1157,
            'y': 3293
          }
        ]
      },
      'description': 'STUND'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1224,
            'y': 3272
          },
          {
            'x': 1275,
            'y': 3273
          },
          {
            'x': 1274,
            'y': 3296
          },
          {
            'x': 1223,
            'y': 3295
          }
        ]
      },
      'description': 'JUMP'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1279,
            'y': 3273
          },
          {
            'x': 1371,
            'y': 3275
          },
          {
            'x': 1370,
            'y': 3298
          },
          {
            'x': 1278,
            'y': 3296
          }
        ]
      },
      'description': 'GRENADE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1397,
            'y': 3276
          },
          {
            'x': 1456,
            'y': 3278
          },
          {
            'x': 1455,
            'y': 3301
          },
          {
            'x': 1396,
            'y': 3299
          }
        ]
      },
      'description': 'GREAT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1459,
            'y': 3278
          },
          {
            'x': 1555,
            'y': 3280
          },
          {
            'x': 1554,
            'y': 3303
          },
          {
            'x': 1458,
            'y': 3301
          }
        ]
      },
      'description': 'NORTHERN'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1562,
            'y': 3280
          },
          {
            'x': 1640,
            'y': 3282
          },
          {
            'x': 1639,
            'y': 3305
          },
          {
            'x': 1561,
            'y': 3303
          }
        ]
      },
      'description': 'ORGONAL'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1083,
            'y': 3293
          },
          {
            'x': 1146,
            'y': 3295
          },
          {
            'x': 1145,
            'y': 3318
          },
          {
            'x': 1082,
            'y': 3316
          }
        ]
      },
      'description': 'SHIRAZ'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1148,
            'y': 3294
          },
          {
            'x': 1266,
            'y': 3297
          },
          {
            'x': 1265,
            'y': 3320
          },
          {
            'x': 1147,
            'y': 3317
          }
        ]
      },
      'description': 'MOUREVORE'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1270,
            'y': 3298
          },
          {
            'x': 1292,
            'y': 3299
          },
          {
            'x': 1291,
            'y': 3321
          },
          {
            'x': 1269,
            'y': 3320
          }
        ]
      },
      'description': 'for'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1297,
            'y': 3298
          },
          {
            'x': 1331,
            'y': 3299
          },
          {
            'x': 1330,
            'y': 3322
          },
          {
            'x': 1296,
            'y': 3321
          }
        ]
      },
      'description': 'only'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1394,
            'y': 3301
          },
          {
            'x': 1446,
            'y': 3303
          },
          {
            'x': 1445,
            'y': 3325
          },
          {
            'x': 1393,
            'y': 3324
          }
        ]
      },
      'description': 'LAGER'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1452,
            'y': 3303
          },
          {
            'x': 1500,
            'y': 3304
          },
          {
            'x': 1499,
            'y': 3327
          },
          {
            'x': 1451,
            'y': 3326
          }
        ]
      },
      'description': 'Battle'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1512,
            'y': 3304
          },
          {
            'x': 1581,
            'y': 3306
          },
          {
            'x': 1580,
            'y': 3329
          },
          {
            'x': 1511,
            'y': 3327
          }
        ]
      },
      'description': '6x3Gord'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1584,
            'y': 3307
          },
          {
            'x': 1589,
            'y': 3307
          },
          {
            'x': 1588,
            'y': 3329
          },
          {
            'x': 1583,
            'y': 3329
          }
        ]
      },
      'description': ')'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1599,
            'y': 3307
          },
          {
            'x': 1616,
            'y': 3307
          },
          {
            'x': 1615,
            'y': 3330
          },
          {
            'x': 1598,
            'y': 3330
          }
        ]
      },
      'description': 'or'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1620,
            'y': 3308
          },
          {
            'x': 1651,
            'y': 3309
          },
          {
            'x': 1650,
            'y': 3331
          },
          {
            'x': 1619,
            'y': 3330
          }
        ]
      },
      'description': 'only'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1708,
            'y': 3284
          },
          {
            'x': 1734,
            'y': 3285
          },
          {
            'x': 1733,
            'y': 3308
          },
          {
            'x': 1707,
            'y': 3307
          }
        ]
      },
      'description': 'MUR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1741,
            'y': 3285
          },
          {
            'x': 1791,
            'y': 3287
          },
          {
            'x': 1790,
            'y': 3310
          },
          {
            'x': 1740,
            'y': 3308
          }
        ]
      },
      'description': 'FINCH'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1802,
            'y': 3287
          },
          {
            'x': 1848,
            'y': 3288
          },
          {
            'x': 1847,
            'y': 3311
          },
          {
            'x': 1801,
            'y': 3310
          }
        ]
      },
      'description': 'CIDER'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1856,
            'y': 3289
          },
          {
            'x': 1942,
            'y': 3292
          },
          {
            'x': 1941,
            'y': 3315
          },
          {
            'x': 1855,
            'y': 3312
          }
        ]
      },
      'description': 'VARIETIES'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1949,
            'y': 3292
          },
          {
            'x': 1993,
            'y': 3293
          },
          {
            'x': 1992,
            'y': 3315
          },
          {
            'x': 1948,
            'y': 3314
          }
        ]
      },
      'description': 'Cos'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1765,
            'y': 3312
          },
          {
            'x': 1858,
            'y': 3315
          },
          {
            'x': 1857,
            'y': 3338
          },
          {
            'x': 1764,
            'y': 3335
          }
        ]
      },
      'description': 'hox375mt'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1864,
            'y': 3315
          },
          {
            'x': 1890,
            'y': 3316
          },
          {
            'x': 1889,
            'y': 3338
          },
          {
            'x': 1863,
            'y': 3337
          }
        ]
      },
      'description': 'for'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1894,
            'y': 3316
          },
          {
            'x': 1925,
            'y': 3317
          },
          {
            'x': 1924,
            'y': 3339
          },
          {
            'x': 1893,
            'y': 3338
          }
        ]
      },
      'description': 'only'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1127,
            'y': 3358
          },
          {
            'x': 1147,
            'y': 3358
          },
          {
            'x': 1146,
            'y': 3427
          },
          {
            'x': 1126,
            'y': 3427
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1173,
            'y': 3358
          },
          {
            'x': 1262,
            'y': 3359
          },
          {
            'x': 1261,
            'y': 3428
          },
          {
            'x': 1172,
            'y': 3427
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1336,
            'y': 3361
          },
          {
            'x': 1387,
            'y': 3362
          },
          {
            'x': 1386,
            'y': 3431
          },
          {
            'x': 1335,
            'y': 3430
          }
        ]
      },
      'description': 'OR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1456,
            'y': 3362
          },
          {
            'x': 1476,
            'y': 3362
          },
          {
            'x': 1475,
            'y': 3431
          },
          {
            'x': 1455,
            'y': 3431
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1502,
            'y': 3363
          },
          {
            'x': 1591,
            'y': 3364
          },
          {
            'x': 1590,
            'y': 3433
          },
          {
            'x': 1501,
            'y': 3432
          }
        ]
      },
      'description': '13'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1658,
            'y': 3365
          },
          {
            'x': 1709,
            'y': 3366
          },
          {
            'x': 1708,
            'y': 3436
          },
          {
            'x': 1657,
            'y': 3435
          }
        ]
      },
      'description': 'OR'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1771,
            'y': 3367
          },
          {
            'x': 1791,
            'y': 3367
          },
          {
            'x': 1790,
            'y': 3436
          },
          {
            'x': 1770,
            'y': 3436
          }
        ]
      },
      'description': '$'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1817,
            'y': 3368
          },
          {
            'x': 1906,
            'y': 3369
          },
          {
            'x': 1905,
            'y': 3438
          },
          {
            'x': 1816,
            'y': 3437
          }
        ]
      },
      'description': '16'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1146,
            'y': 3451
          },
          {
            'x': 1242,
            'y': 3448
          },
          {
            'x': 1243,
            'y': 3489
          },
          {
            'x': 1147,
            'y': 3492
          }
        ]
      },
      'description': 'each'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1479,
            'y': 3460
          },
          {
            'x': 1489,
            'y': 3460
          },
          {
            'x': 1489,
            'y': 3498
          },
          {
            'x': 1479,
            'y': 3498
          }
        ]
      },
      'description': '6'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1513,
            'y': 3460
          },
          {
            'x': 1561,
            'y': 3460
          },
          {
            'x': 1561,
            'y': 3498
          },
          {
            'x': 1513,
            'y': 3498
          }
        ]
      },
      'description': 'pk'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1797,
            'y': 3466
          },
          {
            'x': 1825,
            'y': 3466
          },
          {
            'x': 1825,
            'y': 3518
          },
          {
            'x': 1797,
            'y': 3518
          }
        ]
      },
      'description': '10'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1853,
            'y': 3466
          },
          {
            'x': 1891,
            'y': 3466
          },
          {
            'x': 1891,
            'y': 3518
          },
          {
            'x': 1853,
            'y': 3518
          }
        ]
      },
      'description': 'pk'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1329,
            'y': 3435
          },
          {
            'x': 1384,
            'y': 3435
          },
          {
            'x': 1384,
            'y': 3455
          },
          {
            'x': 1329,
            'y': 3455
          }
        ]
      },
      'description': 'AND'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1652,
            'y': 3444
          },
          {
            'x': 1704,
            'y': 3444
          },
          {
            'x': 1704,
            'y': 3465
          },
          {
            'x': 1652,
            'y': 3465
          }
        ]
      },
      'description': 'AND'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1049,
            'y': 3509
          },
          {
            'x': 1121,
            'y': 3512
          },
          {
            'x': 1120,
            'y': 3542
          },
          {
            'x': 1048,
            'y': 3539
          }
        ]
      },
      'description': 'Present'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1125,
            'y': 3512
          },
          {
            'x': 1157,
            'y': 3513
          },
          {
            'x': 1156,
            'y': 3543
          },
          {
            'x': 1124,
            'y': 3542
          }
        ]
      },
      'description': 'this'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1166,
            'y': 3513
          },
          {
            'x': 1229,
            'y': 3515
          },
          {
            'x': 1228,
            'y': 3545
          },
          {
            'x': 1165,
            'y': 3543
          }
        ]
      },
      'description': 'docket'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1232,
            'y': 3516
          },
          {
            'x': 1253,
            'y': 3517
          },
          {
            'x': 1252,
            'y': 3547
          },
          {
            'x': 1231,
            'y': 3546
          }
        ]
      },
      'description': 'at'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1257,
            'y': 3517
          },
          {
            'x': 1359,
            'y': 3521
          },
          {
            'x': 1358,
            'y': 3550
          },
          {
            'x': 1256,
            'y': 3546
          }
        ]
      },
      'description': 'Liquorlond'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1358,
            'y': 3521
          },
          {
            'x': 1366,
            'y': 3521
          },
          {
            'x': 1365,
            'y': 3550
          },
          {
            'x': 1357,
            'y': 3550
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1371,
            'y': 3521
          },
          {
            'x': 1391,
            'y': 3522
          },
          {
            'x': 1390,
            'y': 3551
          },
          {
            'x': 1370,
            'y': 3550
          }
        ]
      },
      'description': 'Iim'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1409,
            'y': 3522
          },
          {
            'x': 1454,
            'y': 3524
          },
          {
            'x': 1453,
            'y': 3554
          },
          {
            'x': 1408,
            'y': 3552
          }
        ]
      },
      'description': 'tone'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1463,
            'y': 3524
          },
          {
            'x': 1525,
            'y': 3526
          },
          {
            'x': 1524,
            'y': 3556
          },
          {
            'x': 1462,
            'y': 3554
          }
        ]
      },
      'description': 'docket'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1529,
            'y': 3527
          },
          {
            'x': 1562,
            'y': 3528
          },
          {
            'x': 1561,
            'y': 3557
          },
          {
            'x': 1528,
            'y': 3556
          }
        ]
      },
      'description': 'per'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1566,
            'y': 3528
          },
          {
            'x': 1655,
            'y': 3531
          },
          {
            'x': 1654,
            'y': 3560
          },
          {
            'x': 1565,
            'y': 3557
          }
        ]
      },
      'description': 'customer'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1664,
            'y': 3531
          },
          {
            'x': 1693,
            'y': 3532
          },
          {
            'x': 1692,
            'y': 3562
          },
          {
            'x': 1663,
            'y': 3561
          }
        ]
      },
      'description': 'per'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1700,
            'y': 3533
          },
          {
            'x': 1733,
            'y': 3534
          },
          {
            'x': 1732,
            'y': 3563
          },
          {
            'x': 1699,
            'y': 3562
          }
        ]
      },
      'description': 'day'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1740,
            'y': 3534
          },
          {
            'x': 1777,
            'y': 3535
          },
          {
            'x': 1776,
            'y': 3564
          },
          {
            'x': 1739,
            'y': 3563
          }
        ]
      },
      'description': 'Not'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1784,
            'y': 3535
          },
          {
            'x': 1864,
            'y': 3538
          },
          {
            'x': 1863,
            'y': 3568
          },
          {
            'x': 1783,
            'y': 3565
          }
        ]
      },
      'description': 'available'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1874,
            'y': 3539
          },
          {
            'x': 1890,
            'y': 3540
          },
          {
            'x': 1889,
            'y': 3569
          },
          {
            'x': 1873,
            'y': 3568
          }
        ]
      },
      'description': 'to'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1901,
            'y': 3540
          },
          {
            'x': 1956,
            'y': 3542
          },
          {
            'x': 1955,
            'y': 3571
          },
          {
            'x': 1900,
            'y': 3569
          }
        ]
      },
      'description': 'under'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1961,
            'y': 3542
          },
          {
            'x': 1990,
            'y': 3543
          },
          {
            'x': 1989,
            'y': 3572
          },
          {
            'x': 1960,
            'y': 3571
          }
        ]
      },
      'description': '18s'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1990,
            'y': 3543
          },
          {
            'x': 1998,
            'y': 3543
          },
          {
            'x': 1997,
            'y': 3572
          },
          {
            'x': 1989,
            'y': 3572
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1033,
            'y': 3541
          },
          {
            'x': 1089,
            'y': 3543
          },
          {
            'x': 1088,
            'y': 3573
          },
          {
            'x': 1032,
            'y': 3571
          }
        ]
      },
      'description': 'North'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1096,
            'y': 3543
          },
          {
            'x': 1128,
            'y': 3544
          },
          {
            'x': 1127,
            'y': 3574
          },
          {
            'x': 1095,
            'y': 3573
          }
        ]
      },
      'description': 'WA'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1139,
            'y': 3545
          },
          {
            'x': 1172,
            'y': 3546
          },
          {
            'x': 1171,
            'y': 3576
          },
          {
            'x': 1138,
            'y': 3575
          }
        ]
      },
      'description': 'and'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1174,
            'y': 3546
          },
          {
            'x': 1206,
            'y': 3547
          },
          {
            'x': 1205,
            'y': 3577
          },
          {
            'x': 1173,
            'y': 3576
          }
        ]
      },
      'description': 'NT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1208,
            'y': 3547
          },
          {
            'x': 1263,
            'y': 3549
          },
          {
            'x': 1262,
            'y': 3579
          },
          {
            'x': 1207,
            'y': 3577
          }
        ]
      },
      'description': 'stores'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1270,
            'y': 3550
          },
          {
            'x': 1354,
            'y': 3553
          },
          {
            'x': 1353,
            'y': 3583
          },
          {
            'x': 1269,
            'y': 3580
          }
        ]
      },
      'description': 'excluded'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1354,
            'y': 3553
          },
          {
            'x': 1362,
            'y': 3553
          },
          {
            'x': 1361,
            'y': 3582
          },
          {
            'x': 1353,
            'y': 3582
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1364,
            'y': 3553
          },
          {
            'x': 1432,
            'y': 3556
          },
          {
            'x': 1431,
            'y': 3585
          },
          {
            'x': 1363,
            'y': 3583
          }
        ]
      },
      'description': 'Docket'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1433,
            'y': 3556
          },
          {
            'x': 1480,
            'y': 3558
          },
          {
            'x': 1479,
            'y': 3587
          },
          {
            'x': 1432,
            'y': 3585
          }
        ]
      },
      'description': 'Deol'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1481,
            'y': 3558
          },
          {
            'x': 1497,
            'y': 3559
          },
          {
            'x': 1496,
            'y': 3588
          },
          {
            'x': 1480,
            'y': 3587
          }
        ]
      },
      'description': 'is'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1501,
            'y': 3558
          },
          {
            'x': 1537,
            'y': 3559
          },
          {
            'x': 1536,
            'y': 3589
          },
          {
            'x': 1500,
            'y': 3588
          }
        ]
      },
      'description': 'only'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1546,
            'y': 3560
          },
          {
            'x': 1590,
            'y': 3562
          },
          {
            'x': 1589,
            'y': 3592
          },
          {
            'x': 1545,
            'y': 3590
          }
        ]
      },
      'description': 'valid'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1599,
            'y': 3562
          },
          {
            'x': 1624,
            'y': 3563
          },
          {
            'x': 1623,
            'y': 3592
          },
          {
            'x': 1598,
            'y': 3591
          }
        ]
      },
      'description': 'for'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1628,
            'y': 3563
          },
          {
            'x': 1738,
            'y': 3567
          },
          {
            'x': 1737,
            'y': 3597
          },
          {
            'x': 1627,
            'y': 3593
          }
        ]
      },
      'description': 'redemption'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1746,
            'y': 3568
          },
          {
            'x': 1756,
            'y': 3568
          },
          {
            'x': 1755,
            'y': 3597
          },
          {
            'x': 1745,
            'y': 3597
          }
        ]
      },
      'description': 'in'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1768,
            'y': 3568
          },
          {
            'x': 1870,
            'y': 3572
          },
          {
            'x': 1869,
            'y': 3602
          },
          {
            'x': 1767,
            'y': 3598
          }
        ]
      },
      'description': 'Liquortond'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1876,
            'y': 3572
          },
          {
            'x': 1910,
            'y': 3573
          },
          {
            'x': 1909,
            'y': 3603
          },
          {
            'x': 1875,
            'y': 3602
          }
        ]
      },
      'description': 'NSW'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1923,
            'y': 3574
          },
          {
            'x': 1931,
            'y': 3574
          },
          {
            'x': 1930,
            'y': 3603
          },
          {
            'x': 1922,
            'y': 3603
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1935,
            'y': 3575
          },
          {
            'x': 1972,
            'y': 3576
          },
          {
            'x': 1971,
            'y': 3605
          },
          {
            'x': 1934,
            'y': 3604
          }
        ]
      },
      'description': 'ACT'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1971,
            'y': 3576
          },
          {
            'x': 1979,
            'y': 3576
          },
          {
            'x': 1978,
            'y': 3605
          },
          {
            'x': 1970,
            'y': 3605
          }
        ]
      },
      'description': ','
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1984,
            'y': 3576
          },
          {
            'x': 2000,
            'y': 3577
          },
          {
            'x': 1999,
            'y': 3607
          },
          {
            'x': 1983,
            'y': 3606
          }
        ]
      },
      'description': 'SA'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1148,
            'y': 3580
          },
          {
            'x': 1156,
            'y': 3580
          },
          {
            'x': 1155,
            'y': 3609
          },
          {
            'x': 1147,
            'y': 3609
          }
        ]
      },
      'description': '&'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1167,
            'y': 3580
          },
          {
            'x': 1201,
            'y': 3581
          },
          {
            'x': 1200,
            'y': 3610
          },
          {
            'x': 1166,
            'y': 3609
          }
        ]
      },
      'description': 'QLD'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1212,
            'y': 3581
          },
          {
            'x': 1267,
            'y': 3583
          },
          {
            'x': 1266,
            'y': 3613
          },
          {
            'x': 1211,
            'y': 3611
          }
        ]
      },
      'description': 'stores'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1265,
            'y': 3583
          },
          {
            'x': 1273,
            'y': 3583
          },
          {
            'x': 1272,
            'y': 3612
          },
          {
            'x': 1264,
            'y': 3612
          }
        ]
      },
      'description': ','
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1277,
            'y': 3583
          },
          {
            'x': 1310,
            'y': 3584
          },
          {
            'x': 1309,
            'y': 3614
          },
          {
            'x': 1276,
            'y': 3613
          }
        ]
      },
      'description': 'See'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1313,
            'y': 3584
          },
          {
            'x': 1359,
            'y': 3585
          },
          {
            'x': 1358,
            'y': 3615
          },
          {
            'x': 1312,
            'y': 3614
          }
        ]
      },
      'description': 'www'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1370,
            'y': 3586
          },
          {
            'x': 1466,
            'y': 3589
          },
          {
            'x': 1465,
            'y': 3619
          },
          {
            'x': 1369,
            'y': 3616
          }
        ]
      },
      'description': 'lquorland'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1466,
            'y': 3590
          },
          {
            'x': 1474,
            'y': 3590
          },
          {
            'x': 1473,
            'y': 3619
          },
          {
            'x': 1465,
            'y': 3619
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1472,
            'y': 3590
          },
          {
            'x': 1501,
            'y': 3591
          },
          {
            'x': 1500,
            'y': 3620
          },
          {
            'x': 1471,
            'y': 3619
          }
        ]
      },
      'description': 'com'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1511,
            'y': 3591
          },
          {
            'x': 1519,
            'y': 3591
          },
          {
            'x': 1518,
            'y': 3620
          },
          {
            'x': 1510,
            'y': 3620
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1520,
            'y': 3591
          },
          {
            'x': 1541,
            'y': 3592
          },
          {
            'x': 1540,
            'y': 3622
          },
          {
            'x': 1519,
            'y': 3621
          }
        ]
      },
      'description': 'au'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1544,
            'y': 3592
          },
          {
            'x': 1552,
            'y': 3592
          },
          {
            'x': 1551,
            'y': 3621
          },
          {
            'x': 1543,
            'y': 3621
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1550,
            'y': 3592
          },
          {
            'x': 1592,
            'y': 3593
          },
          {
            'x': 1591,
            'y': 3622
          },
          {
            'x': 1549,
            'y': 3621
          }
        ]
      },
      'description': 'Help'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1598,
            'y': 3594
          },
          {
            'x': 1606,
            'y': 3594
          },
          {
            'x': 1605,
            'y': 3623
          },
          {
            'x': 1597,
            'y': 3623
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1607,
            'y': 3594
          },
          {
            'x': 1767,
            'y': 3599
          },
          {
            'x': 1766,
            'y': 3629
          },
          {
            'x': 1606,
            'y': 3624
          }
        ]
      },
      'description': 'Termisconditions'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1774,
            'y': 3599
          },
          {
            'x': 1799,
            'y': 3600
          },
          {
            'x': 1798,
            'y': 3630
          },
          {
            'x': 1773,
            'y': 3629
          }
        ]
      },
      'description': 'for'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1803,
            'y': 3600
          },
          {
            'x': 1832,
            'y': 3601
          },
          {
            'x': 1831,
            'y': 3631
          },
          {
            'x': 1802,
            'y': 3630
          }
        ]
      },
      'description': 'full'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1841,
            'y': 3602
          },
          {
            'x': 1849,
            'y': 3602
          },
          {
            'x': 1848,
            'y': 3631
          },
          {
            'x': 1840,
            'y': 3631
          }
        ]
      },
      'description': 'T'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1886,
            'y': 3603
          },
          {
            'x': 1894,
            'y': 3603
          },
          {
            'x': 1893,
            'y': 3632
          },
          {
            'x': 1885,
            'y': 3632
          }
        ]
      },
      'description': '.'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1054,
            'y': 3623
          },
          {
            'x': 1075,
            'y': 3624
          },
          {
            'x': 1073,
            'y': 3683
          },
          {
            'x': 1052,
            'y': 3682
          }
        ]
      },
      'description': 'ID'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1113,
            'y': 3625
          },
          {
            'x': 1204,
            'y': 3628
          },
          {
            'x': 1202,
            'y': 3687
          },
          {
            'x': 1111,
            'y': 3684
          }
        ]
      },
      'description': '250'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1186,
            'y': 3639
          },
          {
            'x': 1220,
            'y': 3639
          },
          {
            'x': 1220,
            'y': 3653
          },
          {
            'x': 1186,
            'y': 3653
          }
        ]
      },
      'description': 'ph'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1379,
            'y': 3635
          },
          {
            'x': 1649,
            'y': 3645
          },
          {
            'x': 1647,
            'y': 3704
          },
          {
            'x': 1377,
            'y': 3694
          }
        ]
      },
      'description': 'LIQUORLAND'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1209,
            'y': 3676
          },
          {
            'x': 1226,
            'y': 3679
          },
          {
            'x': 1223,
            'y': 3694
          },
          {
            'x': 1206,
            'y': 3691
          }
        ]
      },
      'description': 'ue'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1710,
            'y': 3648
          },
          {
            'x': 1775,
            'y': 3650
          },
          {
            'x': 1773,
            'y': 3708
          },
          {
            'x': 1708,
            'y': 3706
          }
        ]
      },
      'description': 'Valid'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1787,
            'y': 3651
          },
          {
            'x': 1853,
            'y': 3654
          },
          {
            'x': 1851,
            'y': 3711
          },
          {
            'x': 1785,
            'y': 3709
          }
        ]
      },
      'description': 'until'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1861,
            'y': 3654
          },
          {
            'x': 1883,
            'y': 3655
          },
          {
            'x': 1881,
            'y': 3713
          },
          {
            'x': 1859,
            'y': 3712
          }
        ]
      },
      'description': '24'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1887,
            'y': 3655
          },
          {
            'x': 1903,
            'y': 3656
          },
          {
            'x': 1901,
            'y': 3714
          },
          {
            'x': 1885,
            'y': 3713
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1905,
            'y': 3655
          },
          {
            'x': 1938,
            'y': 3656
          },
          {
            'x': 1936,
            'y': 3715
          },
          {
            'x': 1903,
            'y': 3714
          }
        ]
      },
      'description': '09'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1940,
            'y': 3657
          },
          {
            'x': 1956,
            'y': 3658
          },
          {
            'x': 1954,
            'y': 3716
          },
          {
            'x': 1938,
            'y': 3715
          }
        ]
      },
      'description': '/'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1955,
            'y': 3658
          },
          {
            'x': 1977,
            'y': 3659
          },
          {
            'x': 1975,
            'y': 3717
          },
          {
            'x': 1953,
            'y': 3716
          }
        ]
      },
      'description': '19'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1186,
            'y': 3802
          },
          {
            'x': 1199,
            'y': 3803
          },
          {
            'x': 1197,
            'y': 3850
          },
          {
            'x': 1184,
            'y': 3849
          }
        ]
      },
      'description': '9'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1227,
            'y': 3804
          },
          {
            'x': 1288,
            'y': 3807
          },
          {
            'x': 1286,
            'y': 3854
          },
          {
            'x': 1225,
            'y': 3851
          }
        ]
      },
      'description': '13'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1312,
            'y': 3806
          },
          {
            'x': 1381,
            'y': 3809
          },
          {
            'x': 1379,
            'y': 3856
          },
          {
            'x': 1310,
            'y': 3853
          }
        ]
      },
      'description': '13'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1402,
            'y': 3811
          },
          {
            'x': 1415,
            'y': 3812
          },
          {
            'x': 1413,
            'y': 3859
          },
          {
            'x': 1400,
            'y': 3858
          }
        ]
      },
      'description': '9'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1445,
            'y': 3813
          },
          {
            'x': 1458,
            'y': 3814
          },
          {
            'x': 1456,
            'y': 3861
          },
          {
            'x': 1443,
            'y': 3860
          }
        ]
      },
      'description': '3'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1484,
            'y': 3814
          },
          {
            'x': 1497,
            'y': 3815
          },
          {
            'x': 1495,
            'y': 3862
          },
          {
            'x': 1482,
            'y': 3861
          }
        ]
      },
      'description': '8'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1517,
            'y': 3815
          },
          {
            'x': 1544,
            'y': 3816
          },
          {
            'x': 1542,
            'y': 3864
          },
          {
            'x': 1515,
            'y': 3863
          }
        ]
      },
      'description': '11'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1550,
            'y': 3816
          },
          {
            'x': 1628,
            'y': 3819
          },
          {
            'x': 1626,
            'y': 3867
          },
          {
            'x': 1548,
            'y': 3864
          }
        ]
      },
      'description': '90'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1643,
            'y': 3820
          },
          {
            'x': 1755,
            'y': 3825
          },
          {
            'x': 1753,
            'y': 3873
          },
          {
            'x': 1641,
            'y': 3868
          }
        ]
      },
      'description': '170'
    },
    {
      'boundingPoly': {
        'vertices': [
          {
            'x': 1777,
            'y': 3827
          },
          {
            'x': 1831,
            'y': 3829
          },
          {
            'x': 1829,
            'y': 3876
          },
          {
            'x': 1775,
            'y': 3874
          }
        ]
      },
      'description': '911'
    }
  ]
}

const columns = [
  { name: 'icon', label: 'Type', field: 'icon', align: 'center' },
  { name: 'category', label: 'Budget Category', field: 'category', align: 'center', sortable: true },
  { name: 'desc', label: 'Description', field: 'desc', align: 'center', sortable: true },
  { name: 'number', label: 'Transaction ID', field: 'number', align: 'center', sortable: true },
  { name: 'date', label: 'Date', field: 'date', align: 'center', sortable: true },
  { name: 'amountAUD', label: 'Amount (AUD)', field: 'amountAUD', align: 'center', sortable: true },
  { name: 'GST', label: 'GST (AUD)', field: 'GST', align: 'center', sortable: true },
  { name: 'international', label: 'International?', field: 'international', align: 'center', sortable: true },
  { name: 'currency', label: 'Currency', field: 'currency', align: 'center', sortable: true },
  { name: 'amountInt', label: 'Amount (Int)', field: 'amountInt', align: 'center', sortable: true },
  // { name: 'type', label: 'Type', field: 'type', align: 'center', sortable: true },
  { name: 'cheque', label: 'Cheque #', field: 'cheque', align: 'center', sortable: true },
  { name: 'deleted', label: 'Deleted', field: 'deleted', align: 'center', sortable: true },
  { name: 'receipt', label: '', field: 'receipt', align: 'center' }
]

var cc = require('currency-codes')

export default {
  data () {
    return {
      // visionData,
      columns,
      filter: '',
      ccOptions: [],
      visibleColumns: ['icon', 'date', 'amountAUD', 'GST', 'type', 'category', 'desc', 'receipt'],
      typeOptions: ['Cash', 'Internet Transfer', 'Cheque', 'Bank Card'],
      pagination: {
        sortBy: 'date',
        descending: true,
        page: 1,
        rowsPerPage: 10
        // rowsNumber: xx if getting data from a server
      },
      newTrans: {
        category: '',
        type: 'Cash',
        date: '',
        amountAUD: '',
        GST: '',
        cheque: ''
      }
    }
  },
  created () {
    // this.$store.dispatch('fetchTransactions', this.$route.params.id)
    // this.$store.dispatch('fetchBudgets', this.$route.params.id)
  },
  methods: {
    getText () {
      visionData.textAnnotations.sort(sortMe)
      let text = ''
      for (var key in visionData.textAnnotations) {
        text += visionData.textAnnotations[key].description
      }
      return text.split('\n')
      function sortMe (a, b) {
        return (b.boundingPoly.vertices[0].x - a.boundingPoly.vertices[0].x) || (b.boundingPoly.vertices[0].y - a.boundingPoly.vertices[0].y)
      }
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.ccOptions = cc.codes()
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.ccOptions = cc.codes().filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    getCategoryById (id) {
      if (this.budgets[id]) {
        return this.budgetCategories[this.budgets[id].category].category
      } else if (this.budgetCategories[id]) {
        return this.budgetCategories[id].category
      } else {
        return ''
      }
    },
    getAmount (text) {
      if (text > '') {
        let totalFound = false
        // let amountFound
        let textArray = text.split('\n').join(' ').split(' ')
        // console.log(textArray.length)
        for (var key in textArray) {
          // console.log(key, textArray[key].toLowerCase())
          if ((textArray[key].toLowerCase().indexOf('total') !== -1) && !(textArray[key].toLowerCase().indexOf('subtotal') !== -1)) {
            // console.log(key + 1)
            totalFound = true
            // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
          }
          if (totalFound && textArray[key].indexOf('$') !== -1) {
            return parseFloat(textArray[key].split('$').join(''))
          }
        }
      }
    },
    getGST (text) {
      if (text > '') {
        let totalFound = false
        // let amountFound
        let textArray = text.split('\n').join(' ').split(' ')
        // console.log(textArray.length)
        for (var key in textArray) {
          // console.log(key, textArray[key].toLowerCase())
          if ((textArray[key].toLowerCase().indexOf('gst') !== -1) || (textArray[key].toLowerCase().indexOf('tax') !== -1)) {
            // console.log(key + 1)
            totalFound = true
            // console.log(textArray[key] + textArray[(parseInt(key) + 1)] + textArray[(parseInt(key) + 2)])
          }
          if ((totalFound || !totalFound) && textArray[key].indexOf('$') !== -1) {
            console.log(key, textArray[key].toLowerCase())
            // return parseFloat(textArray[key].split('$').join(''))
          }
        }
      }
    }
    // async getReceipt (id) {
    //   // return firebase.auth().onAuthStateChanged(async (user) => {
    //   // console.log(this.idToken)
    //   if (this.idToken > '' && id > '') {
    //     const src = `/receipt?projectId=${this.project.id}&id=${id}`
    //     const options = {
    //       headers: {
    //         Authorization: `Bearer ${this.idToken}`
    //       }
    //     }

    //     let res = await fetch(src, options)
    //     console.log(id, res)
    //     let url = await res.text()
    //     console.log(url)
    //     return url
    //   }
    //   // })
    // }
  },
  computed: {
    ...mapGetters([
      'project',
      'idToken',
      'transactions',
      'budgets',
      'budgetOptions',
      'budgetCategories'
    ]),
    transactionsFiltered () {
      // for (var key in this.transactions) {
      //   if (this.transactions[key].receiptURL <= '') {
      //     this.transactions[key].receiptURL
      //   }
      // }
      if (this.$route.params.budgetCategory) {
        let transactions = []
        // console.log(this.transactions)
        for (var key in this.transactions) {
          // console.log(this.$route.params.budgetCategory, '===', this.transactions[key].category)
          if (this.$route.params.budgetCategory === this.transactions[key].category) {
            transactions.push(this.transactions[key])
          }
        }
        return transactions
      } else {
        return this.transactions
      }
    }
  },
  components: {
    'q-firebase-uploader': () => import('../components/q-firebase-uploader-base.vue'),
    'sp-receipt': () => import('../components/sp-receipt.vue')
  }
}
</script>
