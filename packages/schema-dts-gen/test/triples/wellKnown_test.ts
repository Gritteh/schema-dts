/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {NamedUrlNode, SchemaString, UrlNode} from '../../src/triples/types.js';
import {
  GetComment,
  GetSubClassOf,
  GetType,
  GetTypes,
  IsDirectlyNamedClass,
} from '../../src/triples/wellKnown.js';

describe('wellKnown', () => {
  describe('GetComment', () => {
    it('returns proper string', () => {
      expect(
        GetComment({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: new SchemaString('foo'),
        })
      ).toEqual({comment: 'foo'});
    });

    it('skips other predicates', () => {
      expect(
        GetComment({
          Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
          Object: new SchemaString('foo'),
        })
      ).toBeNull();

      expect(
        GetComment({
          Predicate: UrlNode.Parse('http://schema.org/comment'),
          Object: new SchemaString('foo'),
        })
      ).toBeNull();
    });

    it('only supports strings as comments', () => {
      expect(() =>
        GetComment({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: UrlNode.Parse('http://schema.org/Amazing'),
        })
      ).toThrowError('non-string object');
    });
  });

  describe('GetSubclassOf', () => {
    it('returns proper parent (http)', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toEqual({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('returns proper parent (https)', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'https://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toEqual({subClassOf: UrlNode.Parse('http://schema.org/Foo')});
    });

    it('skips other predicates', () => {
      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse('https://schema.org/knowsAbout'),
          Object: new SchemaString('foo'),
        })
      ).toBeNull();

      expect(
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#comment'
          ),
          Object: UrlNode.Parse('http://schema.org/Foo'),
        })
      ).toBeNull();
    });

    it('only supports UrlNodes as parents', () => {
      expect(() =>
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: new SchemaString('foo'),
        })
      ).toThrowError('Unexpected object for predicate');
    });

    it('only supports named UrlNodes as parents', () => {
      expect(() =>
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('https://schema.org/'),
        })
      ).toThrowError('Unexpected "unnamed" URL used as a super-class');

      expect(() =>
        GetSubClassOf({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/2000/01/rdf-schema#subClassOf'
          ),
          Object: UrlNode.Parse('https://schema.org'),
        })
      ).toThrowError('Unexpected "unnamed" URL used as a super-class');
    });
  });

  describe('GetType', () => {
    it('returns proper type (enum)', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: UrlNode.Parse('https://schema.org/Foo'),
        })
      ).toEqual(UrlNode.Parse('https://schema.org/Foo'));
    });

    it('returns proper type (class)', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toEqual(UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'));
    });

    it('skips other predicates', () => {
      expect(
        GetType({
          Predicate: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#type'),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toBeNull();

      expect(
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#property'
          ),
          Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        })
      ).toBeNull();
    });

    it('only supports UrlNodes as types', () => {
      expect(() =>
        GetType({
          Predicate: UrlNode.Parse(
            'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
          ),
          Object: new SchemaString('foo'),
        })
      ).toThrowError('Unexpected type');
    });
  });

  describe('GetTypes', () => {
    it('Returns one', () => {
      expect(
        GetTypes(UrlNode.Parse('https://schema.org/Thing'), [
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/2000/01/rdf-schema#label'
            ),
            Object: new SchemaString('Thing'),
          },
        ])
      ).toEqual([UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class')]);
    });

    it('Returns multiple', () => {
      expect(
        GetTypes(UrlNode.Parse('https://schema.org/Widget'), [
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/2000/01/rdf-schema#label'
            ),
            Object: new SchemaString('Thing'),
          },
          {
            Predicate: UrlNode.Parse(
              'http://www.w3.org/1999/02/22-rdf-syntax-ns#type'
            ),
            Object: UrlNode.Parse('http://schema.org/Thing'),
          },
        ])
      ).toEqual([
        UrlNode.Parse('http://www.w3.org/2000/01/rdf-schema#Class'),
        UrlNode.Parse('http://schema.org/Thing'),
      ]);
    });
  });

  describe('IsDirectlyNamedClass', () => {
    const cls = UrlNode.Parse(
      'http://www.w3.org/2000/01/rdf-schema#Class'
    ) as NamedUrlNode;
    const dataType = UrlNode.Parse(
      'http://schema.org/DataType'
    ) as NamedUrlNode;
    const bool = UrlNode.Parse('http://schema.org/Boolean') as NamedUrlNode;

    it('a data type is a named class', () => {
      expect(
        IsDirectlyNamedClass({
          Subject: UrlNode.Parse('https://schema.org/Text'),
          types: [cls, dataType],
          values: [],
        })
      ).toBe(true);

      expect(
        IsDirectlyNamedClass({
          Subject: UrlNode.Parse('https://schema.org/Text'),
          types: [dataType, cls],
          values: [],
        })
      ).toBe(true);
    });

    it('an only-enum is not a class', () => {
      expect(
        IsDirectlyNamedClass({
          Subject: UrlNode.Parse('https://schema.org/True'),
          types: [bool],
          values: [],
        })
      ).toBe(false);
    });

    it('an enum can still be a class', () => {
      expect(
        IsDirectlyNamedClass({
          Subject: UrlNode.Parse('https://schema.org/ItsComplicated'),
          types: [bool, cls],
          values: [],
        })
      ).toBe(true);
    });

    it('the DataType union is a class', () => {
      expect(
        IsDirectlyNamedClass({
          Subject: UrlNode.Parse('https://schema.org/DataType'),
          types: [cls],
          values: [
            {
              Predicate: UrlNode.Parse(
                'http://www.w3.org/2000/01/rdf-schema#subClassOf'
              ),
              Object: UrlNode.Parse(
                'http://www.w3.org/2000/01/rdf-schema#Class'
              ),
            },
          ],
        })
      ).toBe(true);
    });
  });
});