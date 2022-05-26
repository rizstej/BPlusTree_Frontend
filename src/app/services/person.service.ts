import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Person } from '../models/person';

export const httpOptions = {
  headers: new HttpHeaders({ 
    'Content-Type': 'application/json',
    'Authorization': '',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods' : 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers' : 'Origin, Content-Type, X-Auth-Token',
  })
};

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private personUrl: string = 'http://localhost:8080/persons';

  constructor(
    private http: HttpClient
  ) { }

  getPersons(): Promise<Person[]> {
    return this.http.get<Person[]>(`${this.personUrl}`, httpOptions).toPromise();
  }

  getPerson(id: number): Promise<Person> {
    return this.http.get<Person>(`${this.personUrl}/${id}`, httpOptions).toPromise();
  }
  
  createPerson(person: Person): Promise<Person> {
    return this.http.post<Person>(`${this.personUrl}`, person, httpOptions).toPromise();
  }
  
  updatePerson(person: Person): Promise<Person> {
    return this.http.put<Person>(`${this.personUrl}/${person.id}`, person, httpOptions).toPromise();
  }
  
  deletePerson(id): Promise<Person> {
    return this.http.delete<Person>(`${this.personUrl}/${id}`, httpOptions).toPromise();
  }
}
