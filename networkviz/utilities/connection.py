"""
This .py implements the connection utilities.
"""
import json
import token
import tokenize
import urllib2
from xml.dom import minidom
from StringIO import StringIO

from vaderviz import settings

return_type = 'xml'
base_url = settings.HOSTNAME + ':' + str(settings.PORT) + '/' + return_type.lower() + '/'


def get_global(name):
    url = base_url + name
    return get_data(url.replace('%', '%25'))


def get_property(category, name):
    url = base_url + category + '/' + name
    return get_data(url.replace('%', '%25'))


def get_data(url):
    connection = urllib2.urlopen(url)
    info = connection.read()
    connection.close()
    if return_type.lower() == 'json':
        try:
            return json.loads(info)['value']
        except ValueError:
            return json.loads(fix_lazy_json(info))['value']
    else:
        xml_doc = minidom.parseString(info)
        item_list = xml_doc.getElementsByTagName('value')
        return item_list[0].childNodes[0].data


def fix_lazy_json(in_text):
    token_gen = tokenize.generate_tokens(StringIO(in_text).readline)
    result = []
    for tok_id, tok_val, _, _, _ in token_gen:
        # fix unquoted strings
        if tok_id == token.NAME:
            if tok_val not in ['true', 'false', 'null', '-Infinity', 'Infinity', 'NaN']:
                tok_id = token.STRING
                tok_val = u'"%s"' % tok_val

        # fix single-quoted strings
        elif tok_id == token.STRING:
            if tok_val.startswith("'"):
                tok_val = u'"%s"' % tok_val[1:-1].replace('"', '\\"')

        # remove invalid commas
        elif (tok_id == token.OP) and ((tok_val == '}') or (tok_val == ']')):
            if (len(result) > 0) and (result[-1][1] == ','):
                result.pop()

        # fix single-quoted strings
        elif tok_id == token.STRING:
            if tok_val.startswith("'"):
                tok_val = u'"%s"' % tok_val[1:-1].replace('"', '\\"')

        result.append((tok_id, tok_val))
    return tokenize.untokenize(result)
