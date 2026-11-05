from artifact_tool import Blob,SpreadsheetFile
from datetime import datetime,timedelta
import json,os,re
D='/mnt/data/palmer-violets-site'; matches=[]
def ds(v):
 if isinstance(v,(float,int)):return (datetime(1899,12,30)+timedelta(days=v)).strftime('%Y-%m-%d')
 if isinstance(v,str):return v[:10]
 return None

def read(f,archivestart,logstart,mode):
 w=SpreadsheetFile.import_xlsx(Blob.load(f))
 a=w.worksheets.get_item('Match Archive').get_range('A1:L35').values
 p=w.worksheets.get_item('Player Match Log').get_range('A1:H250').values
 people={}
 for row in p[logstart:]:
  if not isinstance(row[0],(float,int)): continue
  idx=int(row[0]); person=str(row[4] or '').strip()
  if not person:continue
  goals=int(row[6] or 0) if mode=='24' else int(row[5] or 0)
  motm=int(row[7] or 0) if mode=='24' else int(row[6] or 0)
  people.setdefault(idx,[]).append({'name':person,'goals':goals,'motm':motm})
 for row in a[archivestart:]:
  if not isinstance(row[0],(float,int)):continue
  idx=int(row[0]); players=people.get(idx,[])
  if mode=='24':
   date=ds(row[1]);opp=row[2]; comp='Warkworth Mixed'; gf=int(row[4]);ga=int(row[5]); phase='League'; own=int(row[7] or 0)
  else:
   date=ds(row[2]);opp=row[3];comp="Hibiscus Coast Mens";gf=int(row[6]);ga=int(row[7]);phase=row[1];own=0
  canonical='Funky Eh' if 'pupp' in opp.lower() or opp=='Funky Eh' else 'Bobby Dazzlers' if opp in ('Bobby Dazzler\'s','Bobby Dazzlers') else opp
  match={'id':('24' if mode=='24' else '25')+'-'+str(idx),'season':'2024/25' if mode=='24' else '2025/26','competition':comp,'phase':phase,'date':date,'opponent':opp,'opponentId':canonical,'gf':gf,'ga':ga,'ownGoals':own,'players':players}
  matches.append(match)
read('/mnt/data/Palmer_Violets_2024-25_Final_Season_Stats.xlsx',5,5,'24')
read('/mnt/data/Palmer_Violets_2025_26_HBC_Mens.xlsx',5,5,'25')

matches.extend([
 {'id':'26-1','season':'2026/27','competition':"Hibiscus Coast Mens",'phase':'League','date':'2026-10-16','opponent':'Rushed Intercourse','opponentId':'Rushed Intercourse','gf':4,'ga':2,'ownGoals':0,'players':[{'name':n,'goals':g,'motm':int(n=='Connor Passingham')} for n,g in [('Christian Collins',1),('Cayden Steffener',2),('Connor Passingham',1),('Jamison Lawrence',0),('Fabiano Jesus',0),('Oliver Graham',0),('Connagh Webb',0),('Taj Oliver',0),('Max Boundy',0),('William Healey',0)]]},
 {'id':'26-2','season':'2026/27','competition':'Hibiscus Coast Mixed','phase':'League','date':'2026-10-16','opponent':'Running on Prosecco','opponentId':'Running on Prosecco','gf':14,'ga':3,'ownGoals':0,'motmStatus':'unconfirmed','players':[{'name':n,'goals':g,'motm':0} for n,g in [('Cayden Steffener',6),('Connor Passingham',2),('Jamison Lawrence',2),('Fabiano Jesus',2),('Connagh Webb',1),('Taj Oliver',1),('Max Boundy',0),('William Healey',0),('Oliver Graham',0),('Niva Smith',0),('Sophia Barnett',0)]]}
])
# integrity reports
for season in ['2024/25','2025/26','2026/27']:
 mm=[m for m in matches if m['season']==season]
 print(season,len(mm),'GF',sum(m['gf'] for m in mm),'GA',sum(m['ga'] for m in mm),'apps',sum(len(m['players']) for m in mm),'playerGoals',sum(sum(p['goals'] for p in m['players']) for m in mm),'OG',sum(m['ownGoals'] for m in mm))
 for m in mm:
  if sum(p['goals'] for p in m['players'])+m['ownGoals']!=m['gf']:print('GOALS MISMATCH',m['id'],m['opponent'])
json.dump({'matches':matches,'lastUpdated':'2026-11-05','notes':['Read-only public statistics. Source data updated through audited records.','Hibiscus Coast Mixed Running on Prosecco match date confirmed as 16 October 2026; MOTM still unconfirmed.','HOTShots goalkeeper excluded from named appearance totals.']},open(D+'/data.json','w'),indent=2)
